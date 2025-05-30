import { onRequest } from "firebase-functions/v2/https";
import { httpsOptions } from "../config";
import { errorMiddleware } from "../middleware";

export const helloWorld = onRequest(
  httpsOptions,
  errorMiddleware(async (req, res) => {
    res.json({ message: "Hello world" });
  })
);
