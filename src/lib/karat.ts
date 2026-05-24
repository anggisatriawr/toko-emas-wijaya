export function getSellKaratMultiplier(karat: string): number {
  switch (karat) {
    case "8K":  return 0.44; // 37.5% -> 44%
    case "9K":  return 0.48; // 42.0% -> 48%
    
    // Default fallback approximations for others if they exist
    case "16K": return 0.70;
    case "18K": return 0.75;
    case "22K": return 0.916;
    case "23K": return 0.958;
    case "24K": return 1.0;
    default:    return 1.0;
  }
}

export function getBuybackKaratMultiplier(karat: string): number {
  switch (karat) {
    case "8K":  return 0.36; // 44% -> 36%
    case "9K":  return 0.40; // 48% -> 40%
    
    // Default fallback approximations for others if they exist
    case "16K": return 0.60;
    case "18K": return 0.65;
    case "22K": return 0.85;
    case "23K": return 0.90;
    case "24K": return 1.0;
    default:    return 1.0;
  }
}
