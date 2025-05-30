import { OpenAiApiService } from "./OpenAIService";
import { parsePdf } from "../utils/parsePdf";
import { debugLog } from "../startup/debug";
import { type EmbeddedChunk } from "../types";

export class RagService {
  private openAiService: OpenAiApiService;

  constructor(openAiService: OpenAiApiService) {
    this.openAiService = openAiService;
  }

  public async loadKnowledgeBase(pdfPath: string): Promise<EmbeddedChunk[]> {
    const chunks = await this.parsePdfToParagraphBasedChunks(pdfPath);
    const knowledgeBase: EmbeddedChunk[] = [];

    for (const chunk of chunks) {
      const embedding = await this.openAiService.createEmbedding(chunk);
      // Load to memory - TODO: use vector DB instead
      knowledgeBase.push({ content: chunk, embedding });
    }

    return knowledgeBase;
  }

  public async ask(query: string): Promise<string> {
    // TODO: load from script to vector DB instead
    const knowledgeBase = await this.loadKnowledgeBase(
      "src/docs/photography-content.pdf"
    );
    const chunks = await this.retrieveRelevantChunks(knowledgeBase, query);
    return await this.openAiService.askOpenAI(query, chunks);
  }

  private async retrieveRelevantChunks(
    knowledgeBase: EmbeddedChunk[],
    query: string,
    topK = 5
  ): Promise<string[]> {
    const queryEmbedding = await this.openAiService.createEmbedding(query);
    const similarities = knowledgeBase.map((chunk) => ({
      content: chunk.content,
      similarity: this.getCosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((c) => c.content);
  }

  /**
   * Note: for best results, consider excluding title pages and TOC from the PDF
   */
  public async parsePdfToParagraphBasedChunks(
    filePath: string,
    maxWordsPerChunk = 500
  ): Promise<string[]> {
    debugLog(
      "Parsing PDF to chunks with proper greedy grouping (~500 words per chunk without cutting text mid-paragraph)..."
    );
    const text = await parsePdf(filePath);

    // Split by paragraph (2 or more line breaks)
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let wordCount = 0;

    for (const para of paragraphs) {
      const words = para.split(/\s+/);
      if (
        wordCount + words.length > maxWordsPerChunk &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.join("\n\n"));
        currentChunk = [];
        wordCount = 0;
      }
      currentChunk.push(para);
      wordCount += words.length;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n\n"));
    }

    return chunks;
  }

  private getCosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  }
}
