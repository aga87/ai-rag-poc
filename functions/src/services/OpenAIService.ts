import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

export const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export class OpenAiApiService {
  private openai?: OpenAI;

  public async createEmbedding(text: string): Promise<number[]> {
    const openai = this.getOpenAI();
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  }

  public async askOpenAI(
    question: string,
    contextChunks: string[]
  ): Promise<string> {
    const openai = this.getOpenAI();
    const prompt = `Answer the question using only the following documentation:\n\n${contextChunks.join(
      "\n---\n"
    )}\n\nQuestion: ${question}`;

    const chat = await openai.chat.completions.create({
      /**
       * Note: upgrade to a better model if you:
       * 	- Notice hallucinations
       *	- Have complex multi-chunk reasoning needs
       *  - Are willing to pay more
       */
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers based only on the given documentation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return chat.choices[0].message?.content?.trim() || "";
  }

  private getOpenAI() {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY.value(),
      });
    }

    return this.openai;
  }
}
