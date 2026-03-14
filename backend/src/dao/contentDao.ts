import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

class ContentDao {
  async generateContent(contentType: string) : Promise<string>{
    try {
      const response = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: contentType }],
        max_tokens: 50,
      });

      return (
        response.choices[0].message?.content?.trim() ||
        "Error generating content"
      );
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate content");
    }
  }
}

export default new ContentDao();
