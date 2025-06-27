import * as pdf from "pdf-parse";

export const parsePdf = async (dataBuffer: Buffer): Promise<string> => {
  const data = await pdf(dataBuffer);
  return data.text;
};
