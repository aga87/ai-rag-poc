import { defineSecret } from "firebase-functions/params";
import { QdrantClient } from "@qdrant/js-client-rest";
import { randomUUID } from "crypto";
import { type EmbeddedChunk } from "../types";

export const QDRANT_API_KEY = defineSecret("QDRANT_API_KEY");
export const QDRANT_CLUSTER_URL = defineSecret("QDRANT_CLUSTER_URL");

export class VectorStoreService {
  private client: QdrantClient | null = null;

  public async upsertChunks(collectionName: string, chunks: EmbeddedChunk[]) {
    await this.createCollectionIfNotExists(collectionName);
    await this.getClient().upsert(collectionName, {
      wait: true,
      points: chunks.map((c) => ({
        id: randomUUID(),
        vector: c.embedding,
        payload: {
          content: c.content,
        },
      })),
    });
  }

  private async createCollectionIfNotExists(
    collectionName: string
  ): Promise<void> {
    const collections = await this.getClient().getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (!exists) {
      await this.getClient().createCollection(collectionName, {
        vectors: {
          size: 1536, // "text-embedding-3-small" outputs 1536-dimensional vectors.
          distance: "Cosine", // Cosine distance is recommended for similarity comparison.
        },
      });
    }
  }

  private getClient(): QdrantClient {
    if (!this.client) {
      const apiKey = QDRANT_API_KEY.value();
      const clusterUrl = QDRANT_CLUSTER_URL.value();
      if (!apiKey || !clusterUrl) {
        throw new Error(
          "QDRANT_API_KEY or QDRANT_CLUSTER_URL is not set in environment variables."
        );
      }
      this.client = new QdrantClient({
        apiKey: apiKey,
        url: clusterUrl,
      });
    }
    return this.client;
  }
}
