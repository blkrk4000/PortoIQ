# PortoIQ - Der intelligente Versandvergleich 📦

PortoIQ ist eine moderne Web-Applikation, die Benutzern hilft, den günstigsten Paketversand innerhalb Deutschlands zu finden. Sie vergleicht Tarife von DHL, Hermes, DPD und GLS basierend auf den eingegebenen Maßen und dem Gewicht.

![PortoIQ Screenshot](https://via.placeholder.com/800x400?text=PortoIQ+Screenshot)

## 🚀 Features

*   **Tarifrechner:** Berechnet automatisch die passenden Tarife basierend auf Länge, Breite, Höhe und Gewicht.
*   **Multi-Carrier:** Unterstützung für DHL, Hermes, DPD und GLS.
*   **Smarte Filterung:** Erkennt automatisch Übergrößen oder zu schwere Pakete und filtert diese aus.
*   **KI-gestützte Preisaktualisierung:** Nutzt die Google Gemini API (mit Google Search Grounding), um Preise tagesaktuell zu halten.
*   **Local Storage:** Speichert aktualisierte Preise und den eigenen API Key lokal im Browser des Nutzers.

## 🛠 Technologien

*   **Frontend:** React 19, TypeScript, TailwindCSS
*   **Icons:** Lucide React
*   **KI Integration:** Google GenAI SDK (Gemini 2.0 Flash)

## 📦 Installation & Setup

1.  Repository klonen:
    ```bash
    git clone https://github.com/dein-username/portoiq.git
    cd portoiq
    ```

2.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```

3.  App starten:
    ```bash
    npm start
    # oder
    npm run dev
    ```

## 🔐 Sicherheit & API Keys

Diese App verwendet einen **"Bring Your Own Key" (BYOK)** Ansatz für die KI-Funktionen, um maximale Sicherheit bei Hosting auf GitHub Pages o.ä. zu gewährleisten.

1.  **Standard:** Die App funktioniert ohne API Key für die reine Tarif-Berechnung (mit den in der App hinterlegten Basispreisen).
2.  **Live-Updates:** Um die Preise live via Google Gemini zu aktualisieren, klicke in der App oben rechts auf das **Zahnrad-Icon (Einstellungen)**.
3.  **Key Eingabe:** Füge dort deinen kostenlosen Google Gemini API Key ein.
4.  **Sicherheit:** Der Key wird **ausschließlich** im `localStorage` deines Browsers gespeichert. Er wird niemals an einen Server des Entwicklers gesendet.

⚠️ **Wichtig für Entwickler:** Lade niemals eine `.env` Datei mit deinem privaten Key auf GitHub hoch! Nutze stattdessen das Einstellungs-Menü der App.

## 🤖 Wie funktioniert das Preis-Update?

Die App verfügt über eine integrierte Datenbank (`constants.ts`) mit Standardpreisen. Klickt der Nutzer auf den "Aktualisieren" Button (Refresh Icon), sendet die App einen Prompt an **Google Gemini**. Das Modell nutzt die Google Suche ("Grounding"), um die aktuellen Preise auf den Webseiten der Anbieter zu recherchieren und aktualisiert die lokale Datenbank der App.

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz veröffentlicht. Siehe [LICENSE](LICENSE) für Details.

---

**Erstellt von:** PortoIQ Contributors & Gemini AI