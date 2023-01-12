import { IDocumentClient } from "src/shared/IDocumentClient";
import { timeout } from "src/shared/utils";

export function createDummyDynamoDbDocumentClient({
  delay = 1000,
}: {
  delay?: number;
} = {}): IDocumentClient {
  const dbClientDouble = {
    update: async (parameters: Record<string, any>) => await timeout(delay),
    get: async (parameters: Record<string, any>) => {
      await timeout(delay);
      return {
        Item: {
          email: parameters.Key.email,
        },
      };
    },
    delete: async (parameters: Record<string, any>) => await timeout(delay),
  };
  return dbClientDouble;
}
