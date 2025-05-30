import { Response } from "express";
import { Request } from "firebase-functions/v2/https";
import { error } from "firebase-functions/logger";
import { HttpError } from "../models";

export const errorMiddleware = (
  handler: (req: Request, res: Response) => Promise<void>
) => {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (err: unknown) {
      let statusCode = 500; // Default to 500 if unknown error
      let errorMsg = "Internal server error.";

      if (err instanceof HttpError) {
        statusCode = err.statusCode;
        errorMsg = err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      error("Error in handler", err);
      res.status(statusCode).json({ error: errorMsg });
    }
  };
};
