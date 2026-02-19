export type CarrierId = 'DHL' | 'HERMES' | 'DPD' | 'GLS' | 'DEUTSCHEPOST';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface PackageSpecs extends Dimensions {
  weight: number;
}

export interface Tariff {
  id: string;
  carrier: CarrierId;
  name: string;
  price: number;
  currency: string;
  features: string[]; // e.g. "Haftung bis 500€", "Sendungsverfolgung"
  
  // Validation Logic Limits
  maxWeight: number; // kg
  
  // DHL Logic
  maxDimensions?: Dimensions; 
  
  // Hermes/DPD/GLS Logic
  maxCombined?: number; // e.g., Longest + Shortest <= X cm
  maxGirth?: number; // Gurtmaß (1xL + 2xW + 2xH)
  
  minDimensions?: Dimensions;
}

export interface CalculationResult {
  tariff: Tariff;
  isMatch: boolean;
  reason?: string; // Why it failed if isMatch is false (optional, mostly for debugging)
}

export interface CarrierConfig {
  id: CarrierId;
  name: string;
  color: string;
  textColor: string;
  logoText: string;
  bookingUrl: string;
}

export interface UpdateResult {
  tariffs: Tariff[];
  changes: string[];
}

export interface ChangeLogEntry {
  date: string;
  changes: string[];
}