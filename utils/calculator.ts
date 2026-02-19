import { PackageSpecs, Tariff, CalculationResult } from '../types';

export const calculateBestRates = (specs: PackageSpecs, tariffs: Tariff[]): CalculationResult[] => {
  const { length, width, height, weight } = specs;
  
  // Sort dimensions to handle rotation (Longest side is what matters most)
  // [Longest, Mid, Shortest]
  const dims = [length, width, height].sort((a, b) => b - a);
  const longest = dims[0];
  const mid = dims[1];
  const shortest = dims[2];

  // Helper values
  const combinedHermes = longest + shortest; // L + S
  const girth = longest + (2 * mid) + (2 * shortest); // L + 2W + 2H

  // 1. Find ALL valid tariffs first
  const allMatches: CalculationResult[] = tariffs.map((tariff) => {
    // Weight Check
    if (weight > tariff.maxWeight) {
      return { tariff, isMatch: false, reason: `Zu schwer (Max ${tariff.maxWeight}kg)` };
    }

    // Dimensions Check
    
    // Case A: Fixed Dimensions (DHL style & Post letters: L x W x H)
    if (tariff.maxDimensions) {
      // Sort tariff max dimensions too to match our sorted package dims
      const maxDims = [
        tariff.maxDimensions.length,
        tariff.maxDimensions.width,
        tariff.maxDimensions.height
      ].sort((a, b) => b - a);

      if (
        longest > maxDims[0] ||
        mid > maxDims[1] ||
        shortest > maxDims[2]
      ) {
        return { tariff, isMatch: false, reason: `Zu groß (Max ${maxDims[0]}x${maxDims[1]}x${maxDims[2]}cm)` };
      }
    }

    // Case B: Combined Dimensions (Hermes/GLS/DPD style: L + S)
    if (tariff.maxCombined) {
      if (combinedHermes > tariff.maxCombined) {
        return { tariff, isMatch: false, reason: `Gurtmaß zu groß (L+K > ${tariff.maxCombined}cm)` };
      }
    }

    // Case C: Girth (Gurtmaß) Check (DHL Sperrgut, DPD/GLS Limits)
    if (tariff.maxGirth) {
      if (girth > tariff.maxGirth) {
        return { tariff, isMatch: false, reason: `Gurtmaß überschritten (Max ${tariff.maxGirth}cm)` };
      }
    }

    return { tariff, isMatch: true };
  }).filter(r => r.isMatch);

  // 2. Filter Logic: Group by Carrier -> Best Price -> Optional Insurance Upgrade
  const finalResults: CalculationResult[] = [];
  const distinctCarriers = Array.from(new Set(allMatches.map(r => r.tariff.carrier)));

  distinctCarriers.forEach(carrier => {
    // Get all matches for this carrier, sorted by price (asc)
    const carrierMatches = allMatches
      .filter(r => r.tariff.carrier === carrier)
      .sort((a, b) => a.tariff.price - b.tariff.price);

    if (carrierMatches.length === 0) return;

    // A. Always take the cheapest option for this carrier
    const cheapest = carrierMatches[0];
    finalResults.push(cheapest);

    // B. Check for liability (Haftung) or if it's a Warensendung vs Standard
    const hasLiability = (t: Tariff) => t.features.some(f => 
      f.includes('Haftung') && !f.toLowerCase().includes('keine')
    );

    // Special logic for Deutsche Post: 
    // If cheapest is "Warensendung" (slow), maybe user wants "Maxibrief" (fast) even if more expensive?
    // Or if cheapest is Standardbrief (uninsured), user might want "Einschreiben" (not implemented yet),
    // but sticking to standard logic: Cheapest first.

    // If the cheapest option has NO liability (e.g. DHL Päckchen),
    // find the next cheapest option that DOES have liability (e.g. DHL Paket)
    // This logic mainly applies to parcel carriers.
    if (!hasLiability(cheapest.tariff)) {
      const insuredOption = carrierMatches.find(r => hasLiability(r.tariff));
      
      // If found and it's not the same as the cheapest (redundancy check), add it
      if (insuredOption && insuredOption.tariff.id !== cheapest.tariff.id) {
        finalResults.push(insuredOption);
      }
    }
  });

  // 3. Final Sort by price across all selected options
  return finalResults.sort((a, b) => a.tariff.price - b.tariff.price);
};