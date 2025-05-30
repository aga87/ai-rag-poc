import { onRequest } from "firebase-functions/v2/https";
import { httpsOptions } from "../config";
import { errorMiddleware } from "../middleware";
import { ragService } from "../startup/services";

export const ask = onRequest(
  httpsOptions,
  errorMiddleware(async (req, res) => {
    const query = req.body.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Invalid query" });
      return;
    }

    const answer = await ragService.ask(query);
    res.json({ answer });
  })
);
