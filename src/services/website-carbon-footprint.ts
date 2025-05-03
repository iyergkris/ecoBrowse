/**
 * Represents the carbon footprint of a website.
 */
export interface WebsiteCarbonFootprint {
  /**
   * The carbon footprint score of the website (0 = best, 1 = worst).
   */
  carbonFootprintScore: number;
  /**
   * Notes explaining the calculation and sources used.
   */
  calculationNotes: string;
  /**
   * Data transfer size in bytes.
   */
  dataTransferSize: number;
  /**
   * Server energy efficiency (0-1).
   */
  serverEnergyEfficiency: number;
  /**
   * Renewable energy usage percentage (0-1).
   */
  renewableEnergyUsage: number;
}

// Function to simulate API call delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Asynchronously calculates the carbon footprint of a website.
 * This is a MOCK implementation.
 *
 * @param websiteUrl The URL of the website to calculate the carbon footprint for.
 * @returns A promise that resolves to a WebsiteCarbonFootprint object containing the carbon footprint score, calculation notes, and other relevant data.
 */
export async function calculateWebsiteCarbonFootprint(
  websiteUrl: string
): Promise<WebsiteCarbonFootprint> {
  // Simulate network delay
  await sleep(1000 + Math.random() * 1000); // Simulate 1-2 seconds delay

  // Simulate potential error for specific domains (for testing)
  if (websiteUrl.includes("error.com")) {
    throw new Error("Simulated API error: Could not analyze this domain.");
  }

  // Generate mock data based somewhat on URL length/complexity (very basic heuristic)
  const urlComplexity = websiteUrl.length / 50; // Simple factor based on length
  const randomFactor = Math.random();

  const dataTransfer = Math.floor((500 * 1024) + (randomFactor * 2 * 1024 * 1024) + (urlComplexity * 512 * 1024)); // 500KB to ~2.5MB
  const serverEfficiency = 0.6 + (randomFactor * 0.35); // 0.6 to 0.95
  const renewableUsage = 0.1 + (randomFactor * 0.8); // 0.1 to 0.9

  // Very basic mock scoring logic (lower score is better)
  // More data transfer = worse score
  // Lower efficiency = worse score
  // Lower renewables = worse score
  const dataScore = Math.min(1, dataTransfer / (2 * 1024 * 1024)); // Normalize based on ~2MB max
  const efficiencyScore = 1 - serverEfficiency;
  const renewableScore = 1 - renewableUsage;

  // Weighted average (adjust weights as needed)
  const carbonFootprintScore = (dataScore * 0.5) + (efficiencyScore * 0.25) + (renewableScore * 0.25);

  return {
    carbonFootprintScore: Math.max(0, Math.min(1, carbonFootprintScore)), // Ensure score is between 0 and 1
    calculationNotes: `Mock calculation based on simulated data transfer, server efficiency, and renewable energy usage. Data estimated from open sources (e.g., Green Web Foundation - simulated). Factors like CDN usage, server location, and specific hardware are approximated. Score: ${carbonFootprintScore.toFixed(3)}`,
    dataTransferSize: dataTransfer,
    serverEnergyEfficiency: serverEfficiency,
    renewableEnergyUsage: renewableUsage,
  };
}
