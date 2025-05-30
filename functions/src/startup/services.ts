import { KnowledgeService, OpenAiApiService } from "../services";

const openAiService = new OpenAiApiService();
export const knowledgeService = new KnowledgeService(openAiService);
