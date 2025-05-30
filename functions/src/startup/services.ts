import { RagService, OpenAiApiService } from "../services";

const openAiService = new OpenAiApiService();
export const ragService = new RagService(openAiService);
