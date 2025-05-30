import { OpenAiApiService } from "./OpenAIService";
import { parsePdf } from "../utils/parsePdf";
import { debugLog } from "../startup/debug";
import { type EmbeddedChunk } from "../types";

export class KnowledgeService {
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
}
