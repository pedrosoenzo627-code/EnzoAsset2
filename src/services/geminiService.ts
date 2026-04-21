import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateRobloxScript = async (assetName: string, category: string, description: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert Roblox Developer. Create a high-quality Lua script for a Roblox asset.
      Asset Name: ${assetName}
      Category: ${category}
      Description: ${description}

      The script should be professional, well-commented, and ready to use in Roblox Studio.
      Include a short explanation before the code code block.
      Format the code block correctly in Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Script Generation Error:", error);
    throw error;
  }
};
