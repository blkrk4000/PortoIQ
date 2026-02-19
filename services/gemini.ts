import { GoogleGenAI } from "@google/genai";
import { Tariff, UpdateResult } from "../types";

// NOTE: We no longer initialize the client globally with a process.env key.
// Instead, we initialize it on demand to support the user changing the key in Settings.

export const fetchLatestTariffPrices = async (currentTariffs: Tariff[]): Promise<UpdateResult | null> => {
  // 1. Try to get key from LocalStorage (User entered)
  // 2. Fallback to process.env (Developer mode / .env file)
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;

  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // We create unique keys like "DPD Paket S", "GLS Paket S" to avoid collisions in the JSON map
    const searchKeys = currentTariffs.map(t => `${t.carrier} ${t.name}`).join(", ");
    
    const today = new Date().toLocaleDateString('de-DE');
    const year = new Date().getFullYear();
    
    const prompt = `
      Recherchiere die AKTUELLEN Online-Versandpreise für DEUTSCHLAND (Privatkunden).
      Nutzerstandort: Deutschland. Währung: EUR.
      HEUTIGES DATUM: ${today}.
      Das aktuelle Jahr ist ${year}.
      
      Ich benötige die Preise, die JETZT (Stand ${today}) gültig sind für folgende spezifische Produkte: ${searchKeys}.
      
      BEACHTE BESONDERHEITEN:
      1. "BüWa" heißt jetzt oft offiziell "Warensendung". Suche nach beiden Begriffen.
      2. Bei DHL gab es Änderungen (z.B. neues Paket 20kg).
      3. Ignoriere "Sparsets" oder Aktionspreise, nimm den regulären Online-Einzeltarif.
      
      WICHTIG - STRIKTE REGELN FÜR DIE PREIS-AUSWAHL:
      1. NATIONALER VERSAND: Nur innerhalb Deutschlands.
      2. ZUSTELLUNG AN DIE HAUSTÜR: Der Preis MUSS für die Zustellung an die Adresse des Empfängers (Haustür) gelten.
      3. SHOP-TO-SHOP IGNORIEREN: Ignoriere Preise für "Zustellung an Paketshop/Packstation", auch wenn diese günstiger sind!
      4. ONLINE PREIS: Nimm den Online-Frankierungspreis (nicht Filialpreis), sofern dieser für die Haustürzustellung verfügbar ist.
      
      SCHRITT FÜR SCHRITT:
      1. Suche nach den aktuellen Preislisten der Anbieter (DHL, Hermes, DPD, GLS).
      2. Verifiziere für jeden angefragten Tarif, ob er Haustürzustellung beinhaltet.
      3. Extrahiere den Online-Preis.
      
      Gib mir ein reines JSON-Objekt zurück.
      Schlüssel: Exakt der angefragte Produktname aus meiner Liste (z.B. "DHL Paket 2 kg").
      Wert: Der Preis als Zahl (in EUR).
      
      Beispiel Format:
      {
        "DHL Paket 2 kg": 5.49,
        "Hermes S-Paket": 4.95
      }
    `;

    // Use Google Search Grounding to get real-time data
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        responseMimeType: "application/json",
      }
    });

    // Extract the JSON text
    const jsonText = response.text;
    if (!jsonText) return null;

    let priceMap: Record<string, number> = {};
    try {
      priceMap = JSON.parse(jsonText);
    } catch (e) {
      // Sometimes the model wraps it in markdown code blocks despite mime type
      const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        priceMap = JSON.parse(match[1]);
      } else {
        // Fallback: try parsing directly
        console.warn("Could not parse JSON directly, attempting cleanup");
        const start = jsonText.indexOf('{');
        const end = jsonText.lastIndexOf('}') + 1;
        if (start >= 0 && end > start) {
           priceMap = JSON.parse(jsonText.substring(start, end));
        }
      }
    }

    const changes: string[] = [];

    // Map new prices to existing tariffs
    const updatedTariffs = currentTariffs.map(tariff => {
      // We reconstruct the key used in the prompt
      const lookupKey = `${tariff.carrier} ${tariff.name}`;
      const newPrice = priceMap[lookupKey];
      
      if (newPrice && typeof newPrice === 'number' && newPrice > 0) {
        // Only update if price is different AND the difference is plausible (> 0.05 change) or just exact match
        // We trust the AI but only for specific product matches.
        
        if (tariff.price !== newPrice) {
            changes.push(`${lookupKey}: ${tariff.price.toFixed(2)}€ → ${newPrice.toFixed(2)}€`);
            console.log(`Updating ${lookupKey}: ${tariff.price} -> ${newPrice} (€)`);
            return { ...tariff, price: newPrice };
        }
      }
      return tariff;
    });

    return { tariffs: updatedTariffs, changes };

  } catch (error) {
    console.error("Gemini Tariff Update Error:", error);
    return null;
  }
};