import {
  GoogleCloudStorageService,
  OpenAiApiService,
  RagService,
  VectorStoreService,
} from "../services";

const googleCloudStorageService = new GoogleCloudStorageService();

const openAiService = new OpenAiApiService();

const vectorStoreService = new VectorStoreService();

export const ragService = new RagService(
  openAiService,
  googleCloudStorageService,
  vectorStoreService
);
