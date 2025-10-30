export const API_BASE_URL = "http://localhost:8010";

export async function fetchEmotionAnalysis(text: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch emotion analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching emotion analysis:", error);
    throw error;
  }
}