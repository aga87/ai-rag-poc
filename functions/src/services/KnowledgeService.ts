import { parsePdf } from "../utils/parsePdf";
import { debugLog } from "../startup/debug";

export class KnowledgeService {
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
