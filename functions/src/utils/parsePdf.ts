import * as fs from "fs/promises";
import * as pdf from "pdf-parse";

export const parsePdf = async (filePath: string): Promise<string> => {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};
