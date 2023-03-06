import { IDocumentClient } from "src/shared/IDocumentClient";
import { timeout } from "src/shared/utils";

export function createDummyDynamoDbDocumentClient({
  delay = 1000,
}: {
  delay?: number;
} = {}): IDocumentClient {
  const dbClientDouble: IDocumentClient = {
    update: async () => await timeout(delay),
    get: async (parameters) => {
      await timeout(delay);
      return {
        Item: {
          email: parameters.Key.email,
        },
      };
    },
    delete: async () => await timeout(delay),
  };
  return dbClientDouble;
}
