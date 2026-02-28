import { CarrierConfig, Tariff } from './types';

// Stand der Daten: 02.03.2026 (Hermes Preisanpassung)
export const DEFAULT_LAST_UPDATED = '02.03.2026';
export const DATA_VERSION = 2; // Increment this to force-reset user data to new defaults

// Carrier Branding
export const CARRIERS: Record<string, CarrierConfig> = {
  DEUTSCHEPOST: {
    id: 'DEUTSCHEPOST',
    name: 'Deutsche Post',
    color: 'bg-[#FFCC00]', 
    textColor: 'text-black', 
    logoText: 'Post',
    bookingUrl: 'https://www.deutschepost.de/de/b/briefe-versenden.html'
  },
  DHL: { 
    id: 'DHL', 
    name: 'DHL', 
    color: 'bg-[#FFCC00]', // Official DHL Yellow
    textColor: 'text-[#D40511]', // Official DHL Red
    logoText: 'DHL',
    bookingUrl: 'https://www.dhl.de/de/privatkunden/pakete-versenden/online-frankieren.html'
  },
  HERMES: { 
    id: 'HERMES', 
    name: 'Hermes', 
    color: 'bg-[#0099DA]', 
    textColor: 'text-white', 
    logoText: 'Hermes',
    bookingUrl: 'https://www.myhermes.de/versenden/paketschein-erstellen/'
  },
  DPD: { 
    id: 'DPD', 
    name: 'DPD', 
    color: 'bg-[#DC0032]', 
    textColor: 'text-white', 
    logoText: 'DPD',
    bookingUrl: 'https://www.dpd.com/de/de/versenden/'
  },
  GLS: { 
    id: 'GLS', 
    name: 'GLS', 
    color: 'bg-[#151854]', 
    textColor: 'text-[#FDB913]', 
    logoText: 'GLS',
    bookingUrl: 'https://www.gls-pakete.de/'
  },
};

/**
 * TARIFF DATABASE (Stand März 2026)
 * Base values for domestic DE shipping (Online Preise).
 */
export const TARIFFS: Tariff[] = [
  // --- DEUTSCHE POST ---
  {
    id: 'post-standardbrief',
    carrier: 'DEUTSCHEPOST',
    name: 'Standardbrief',
    price: 0.95, 
    currency: '€',
    maxWeight: 0.02, // 20g
    maxDimensions: { length: 23.5, width: 12.5, height: 0.5 },
    features: ['Nur Dokumente', 'Keine Haftung'],
  },
  {
    id: 'post-kompaktbrief',
    carrier: 'DEUTSCHEPOST',
    name: 'Kompaktbrief',
    price: 1.10, 
    currency: '€',
    maxWeight: 0.05, // 50g
    maxDimensions: { length: 23.5, width: 12.5, height: 1.0 },
    features: ['Nur Dokumente', 'Keine Haftung'],
  },
  {
    id: 'post-grossbrief',
    carrier: 'DEUTSCHEPOST',
    name: 'Großbrief',
    price: 1.80, 
    currency: '€',
    maxWeight: 0.5, // 500g
    maxDimensions: { length: 35.3, width: 25, height: 2.0 },
    features: ['Dokumente & Waren', 'Keine Haftung'],
  },
  {
    id: 'post-maxibrief',
    carrier: 'DEUTSCHEPOST',
    name: 'Maxibrief',
    price: 2.90, 
    currency: '€',
    maxWeight: 1.0, // 1kg
    maxDimensions: { length: 35.3, width: 25, height: 5.0 },
    features: ['Dokumente & Waren', 'Keine Haftung'],
  },
  // Neue Warensendungs-Struktur 2026
  {
    id: 'post-warensendung-1000',
    carrier: 'DEUTSCHEPOST',
    name: 'Warensendung (bis 1000g)',
    price: 2.70, 
    currency: '€',
    maxWeight: 1.0, // 1kg
    maxDimensions: { length: 35.3, width: 25, height: 5.0 },
    features: ['Waren & Bücher', 'Längere Laufzeit'],
  },
  {
    id: 'post-warensendung-2000',
    carrier: 'DEUTSCHEPOST',
    name: 'Warensendung (bis 2000g)',
    price: 3.55, // 2.70 + 0.85 Zuschlag
    currency: '€',
    maxWeight: 2.0, // 2kg
    maxDimensions: { length: 35.3, width: 25, height: 5.0 },
    features: ['Waren & Bücher', 'Längere Laufzeit'],
  },

  // --- DHL (Online Preise März 2026) ---
  {
    id: 'dhl-paeckchen-s',
    carrier: 'DHL',
    name: 'Päckchen S',
    price: 4.19,
    currency: '€',
    maxWeight: 2,
    maxDimensions: { length: 35, width: 25, height: 10 },
    features: ['Keine Haftung', 'Keine Sendungsverfolgung'],
  },
  {
    id: 'dhl-paeckchen-m',
    carrier: 'DHL',
    name: 'Päckchen M',
    price: 5.19,
    currency: '€',
    maxWeight: 2,
    maxDimensions: { length: 60, width: 30, height: 15 },
    features: ['Keine Haftung', 'Keine Sendungsverfolgung'],
  },
  {
    id: 'dhl-paket-2kg',
    carrier: 'DHL',
    name: 'Paket 2 kg',
    price: 6.19,
    currency: '€',
    maxWeight: 2,
    maxDimensions: { length: 60, width: 30, height: 15 },
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dhl-paket-5kg',
    carrier: 'DHL',
    name: 'Paket 5 kg',
    price: 7.69,
    currency: '€',
    maxWeight: 5,
    maxDimensions: { length: 120, width: 60, height: 60 },
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dhl-paket-10kg',
    carrier: 'DHL',
    name: 'Paket 10 kg',
    price: 10.49,
    currency: '€',
    maxWeight: 10,
    maxDimensions: { length: 120, width: 60, height: 60 },
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dhl-paket-20kg',
    carrier: 'DHL',
    name: 'Paket 20 kg',
    price: 18.99,
    currency: '€',
    maxWeight: 20,
    maxDimensions: { length: 120, width: 60, height: 60 },
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dhl-paket-31kg',
    carrier: 'DHL',
    name: 'Paket 31,5 kg',
    price: 23.99,
    currency: '€',
    maxWeight: 31.5,
    maxDimensions: { length: 120, width: 60, height: 60 },
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },

  // --- HERMES (Online / Haustür Preise März 2026) ---
  {
    id: 'hermes-paeckchen',
    carrier: 'HERMES',
    name: 'Hermes Päckchen',
    price: 5.19,
    currency: '€',
    maxWeight: 25,
    maxCombined: 37, // L + S
    features: ['Haftung bis 50 €', 'Sendungsverfolgung'],
  },
  {
    id: 'hermes-s',
    carrier: 'HERMES',
    name: 'S-Paket',
    price: 5.79,
    currency: '€',
    maxWeight: 25,
    maxCombined: 50,
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'hermes-m',
    carrier: 'HERMES',
    name: 'M-Paket',
    price: 6.99, // Updated
    currency: '€',
    maxWeight: 25,
    maxCombined: 80,
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'hermes-l',
    carrier: 'HERMES',
    name: 'L-Paket',
    price: 10.99, // Updated
    currency: '€',
    maxWeight: 25,
    maxCombined: 120,
    features: ['Haftung bis 500 €', 'Sendungsverfolgung'],
  },
  {
    id: 'hermes-xl',
    carrier: 'HERMES',
    name: 'XL-Paket',
    price: 28.99, // Updated (inkl Abholung)
    currency: '€',
    maxWeight: 31.5,
    maxCombined: 150,
    features: ['Haftung bis 500 €', 'Sendungsverfolgung', 'Inkl. Abholung'],
  },
  {
    id: 'hermes-xxl',
    carrier: 'HERMES',
    name: 'XXL-Paket',
    price: 33.99, // Updated (inkl Abholung)
    currency: '€',
    maxWeight: 31.5,
    maxCombined: 200, 
    features: ['Haftung bis 500 €', 'Sendungsverfolgung', 'Inkl. Abholung'],
  },

  // --- DPD (Online Preise März 2026, max 20kg) ---
  {
    id: 'dpd-xs',
    carrier: 'DPD',
    name: 'Paket XS',
    price: 4.59, // Updated
    currency: '€',
    maxWeight: 20, // Updated
    maxCombined: 35, // L + S
    features: ['Haftung bis 520 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dpd-s',
    carrier: 'DPD',
    name: 'Paket S',
    price: 5.19, // Updated
    currency: '€',
    maxWeight: 20, // Updated
    maxCombined: 50,
    features: ['Haftung bis 520 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dpd-m',
    carrier: 'DPD',
    name: 'Paket M',
    price: 6.90, // Updated
    currency: '€',
    maxWeight: 20, // Updated
    maxCombined: 70,
    features: ['Haftung bis 520 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dpd-l',
    carrier: 'DPD',
    name: 'Paket L',
    price: 10.90, // Updated
    currency: '€',
    maxWeight: 20, // Updated
    maxCombined: 90,
    features: ['Haftung bis 520 €', 'Sendungsverfolgung'],
  },
  {
    id: 'dpd-xl',
    carrier: 'DPD',
    name: 'Paket XL',
    price: 18.40, // Updated
    currency: '€',
    maxWeight: 20, // Updated
    maxCombined: 300, 
    maxGirth: 300, // DPD Max Girth
    features: ['Haftung bis 520 €', 'Sendungsverfolgung'],
  },

  // --- GLS (Online Preise März 2026) ---
  {
    id: 'gls-xs',
    carrier: 'GLS',
    name: 'Paket XS',
    price: 4.59,
    currency: '€',
    maxWeight: 40,
    maxCombined: 35,
    features: ['Haftung bis 750 €', 'Sendungsverfolgung'],
  },
  {
    id: 'gls-s',
    carrier: 'GLS',
    name: 'Paket S',
    price: 5.19,
    currency: '€',
    maxWeight: 40,
    maxCombined: 50,
    features: ['Haftung bis 750 €', 'Sendungsverfolgung'],
  },
  {
    id: 'gls-m',
    carrier: 'GLS',
    name: 'Paket M',
    price: 6.89,
    currency: '€',
    maxWeight: 40,
    maxCombined: 65,
    features: ['Haftung bis 750 €', 'Sendungsverfolgung'],
  },
  {
    id: 'gls-l',
    carrier: 'GLS',
    name: 'Paket L',
    price: 10.89,
    currency: '€',
    maxWeight: 40,
    maxCombined: 80,
    features: ['Haftung bis 750 €', 'Sendungsverfolgung'],
  },
  {
    id: 'gls-xl',
    carrier: 'GLS',
    name: 'Paket XL',
    price: 22.00,
    currency: '€',
    maxWeight: 40,
    maxCombined: 300,
    maxGirth: 300, 
    features: ['Haftung bis 750 €', 'Sendungsverfolgung'],
  },
];