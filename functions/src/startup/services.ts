import {
  GoogleCloudStorageService,
  OpenAiApiService,
  RagService,
} from "../services";

const googleCloudStorageService = new GoogleCloudStorageService();
const openAiService = new OpenAiApiService();
export const ragService = new RagService(
  openAiService,
  googleCloudStorageService
);
