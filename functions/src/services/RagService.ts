import { GoogleCloudStorageService } from "./GoogleCloudStorageService";
import { OpenAiApiService } from "./OpenAIService";
import { VectorStoreService } from "./VectorStoreService";
import { parsePdf } from "../utils/parsePdf";
import { debugLog } from "../startup/debug";
import { type EmbeddedChunk } from "../types";

export class RagService {
  private openAiService: OpenAiApiService;
  private googleCloudStorageService: GoogleCloudStorageService;
  private vectorStoreService: VectorStoreService;

  private bucketName = "mg_rag_poc_docs";
  private bucketFileName = "photography-content.pdf";
  private vectorStoreCollectionName = "knowledge_base";

  constructor(
    openAiService: OpenAiApiService,
    googleCloudStorageService: GoogleCloudStorageService,
    vectorStoreService: VectorStoreService
  ) {
    this.openAiService = openAiService;
    this.googleCloudStorageService = googleCloudStorageService;
    this.vectorStoreService = vectorStoreService;
  }

  public async loadKnowledgeBase() {
    debugLog("Loading knowledge base: reading PDF from bucket...");

    const pdfBuffer = await this.googleCloudStorageService.readFileContents(
      this.bucketName,
      this.bucketFileName
    );

    debugLog("Loading knowledge base: parsing PDF into chunks...");

    const chunks = await this.parsePdfToParagraphBasedChunks(pdfBuffer);

    debugLog("Loading knowledge base: creating embeddings...");

    const embeddings: EmbeddedChunk[] = await Promise.all(
      chunks.map(async (chunk) => ({
        content: chunk,
        embedding: await this.openAiService.createEmbedding(chunk),
      }))
    );

    debugLog("Loading knowledge base: saving embeddings to vector DB...");
    await this.vectorStoreService.upsertChunks(
      this.vectorStoreCollectionName,
      embeddings
    );

    debugLog("Knowledge base loaded.");
  }

  public async ask(query: string): Promise<string> {
    debugLog("Retrieving relevant chunks from knowledge base...");
    const chunks = await this.retrieveRelevantChunks(query);

    const userPrompt = `Answer the question using only the following documentation:\n\n${chunks.join(
      "\n---\n"
    )}\n\nQuestion: ${query}`;

    const systemPrompt =
      "You are a helpful assistant that answers based only on the given documentation.";

    return await this.openAiService.ask(systemPrompt, userPrompt);
  }

  private async retrieveRelevantChunks(query: string, topK = 5) {
    const queryEmbedding = await this.openAiService.createEmbedding(query);

    const results = await this.vectorStoreService.search(
      this.vectorStoreCollectionName,
      queryEmbedding,
      topK
    );

    return results.map((r) => r.content);
  }

  /**
   * Note: for best results, consider excluding title pages and TOC from the PDF
   */
  public async parsePdfToParagraphBasedChunks(
    pdfBuffer: Buffer,
    maxWordsPerChunk = 500
  ): Promise<string[]> {
    debugLog(
      "Parsing PDF to chunks with proper greedy grouping (~500 words per chunk without cutting text mid-paragraph)..."
    );
    const text = await parsePdf(pdfBuffer);

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
