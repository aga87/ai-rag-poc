import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

export const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

export class OpenAiApiService {
  private openai?: OpenAI;

  // Test connection — quick way to confirm API access works
  public async testConnection(): Promise<string> {
    const openai = this.getOpenAI();

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4-turbo
      messages: [{ role: "user", content: "Say hello!" }],
    });

    return chat.choices[0].message?.content?.trim() || "";
  }

  // Generic chat method: given a message, get a reply from the model.
  public async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    const openai = this.getOpenAI();

    const chatConfig = this.getChatConfig(systemPrompt, userPrompt, false);
    const chat = await openai.chat.completions.create(chatConfig);

    return chat.choices[0].message?.content?.trim() || "";
  }

  public async *askStream(
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const openai = this.getOpenAI();

    const chatConfig = this.getChatConfig(systemPrompt, userPrompt, true);
    const stream = await openai.chat.completions.create(chatConfig);

    for await (const part of stream) {
      const chunk = part.choices?.[0]?.delta?.content;
      if (typeof chunk === "string") {
        yield chunk;
      }
    }
  }

  public async createEmbedding(text: string): Promise<number[]> {
    const openai = this.getOpenAI();
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return res.data[0].embedding;
  }

  // Strict overloads for getChatConfig to ensure correct return type based on stream parameter
  private getChatConfig(
    systemPrompt: string,
    userPrompt: string,
    stream: false
  ): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;

  private getChatConfig(
    systemPrompt: string,
    userPrompt: string,
    stream: true
  ): OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming;

  private getChatConfig(
    systemPrompt: string,
    userPrompt: string,
    stream: boolean
  ): OpenAI.Chat.Completions.ChatCompletionCreateParams {
    return {
      /**
       * Note: upgrade to a better model if you:
       * 	- Notice hallucinations
       *	- Have complex multi-chunk reasoning needs
       *  - Are willing to pay more
       */
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream,
    } as OpenAI.Chat.Completions.ChatCompletionCreateParams;
  }

  private getOpenAI() {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set in environment variables.");
      }
      this.openai = new OpenAI({
        apiKey,
      });
    }

    return this.openai;
  }
}
