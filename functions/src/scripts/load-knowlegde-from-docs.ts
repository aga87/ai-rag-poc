import { ragService } from "../startup/services";
import { debugLog } from "../startup/debug";

(async () => {
  try {
    const chunks = await ragService.parsePdfToParagraphBasedChunks(
      "src/docs/photography-content.pdf",
      500
    );
    debugLog(`Parsed ${chunks.length} chunks.`);
    debugLog(chunks[0]);
  } catch (err) {
    console.error("Failed to parse PDF:", err);
  }
})();
