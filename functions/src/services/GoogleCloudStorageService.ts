import { Storage, type File } from "@google-cloud/storage";
import { debugLog } from "../startup/debug";

export class GoogleCloudStorageService {
  private storage: Storage | null = null;

  private getStorage(): Storage {
    if (!this.storage) {
      this.storage = new Storage();
    }
    return this.storage;
  }

  public getFileReference(bucketName: string, filePath: string): File {
    return this.getStorage().bucket(bucketName).file(filePath);
  }

  /**
   * Read file contents from a bucket
   */
  public async readFileContents(
    bucketName: string,
    filePath: string
  ): Promise<Buffer> {
    try {
      const file = this.getFileReference(bucketName, filePath);
      const [contents] = await file.download();
      debugLog(`File ${filePath} downloaded from bucket ${bucketName}`);
      return contents;
    } catch (err: unknown) {
      debugLog(
        `Error reading file ${filePath} from bucket ${bucketName}: ${String(
          err
        )}`
      );
      throw err;
    }
  }
}
