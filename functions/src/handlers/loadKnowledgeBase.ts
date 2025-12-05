import { onRequest } from "firebase-functions/v2/https";
import { httpsOptions } from "../config";
import { errorMiddleware } from "../middleware";
import { ragService } from "../startup/services";
import {
  OPENAI_API_KEY,
  QDRANT_API_KEY,
  QDRANT_CLUSTER_URL,
} from "../services";

export const loadKnowledgeBase = onRequest(
  {
    ...httpsOptions,
    secrets: [
      OPENAI_API_KEY.name,
      QDRANT_API_KEY.name,
      QDRANT_CLUSTER_URL.name,
    ],
  },
  errorMiddleware(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send({ error: "Method Not Allowed. Use POST." });
      return;
    }

    await ragService.loadKnowledgeBase();
    res.json({ message: "Knowledge base loaded successfully." });
  })
);
