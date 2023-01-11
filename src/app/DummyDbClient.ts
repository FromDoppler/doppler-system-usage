import { DynamoDocumentClient } from "src/shared/DynamoDocumentClient";
import { createPromiseWrapperWithDelay } from "../shared/utils";

export function createDummyDynamoDbDocumentClient({
  delay = 1000,
}: {
  delay?: number;
} = {}): DynamoDocumentClient {
  const dbClientDouble = {
    update: () => createPromiseWrapperWithDelay(delay),
    get: (key: Record<string, any>) =>
      createPromiseWrapperWithDelay(delay, () => ({
        Item: {
          email: key.email,
        },
      })),
    delete: (key: Record<string, any>) => createPromiseWrapperWithDelay(delay),
  };
  return dbClientDouble as unknown as DynamoDocumentClient;
}
