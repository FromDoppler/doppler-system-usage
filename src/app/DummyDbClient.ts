import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { createPromiseWrapperWithDelay } from "../shared/utils";

export function createDummyDynamoDbClient({
  delay = 1000,
}: {
  delay?: number;
} = {}): DynamoDB.DocumentClient {
  const dbClientDouble = {
    update: () => createPromiseWrapperWithDelay(delay),
    get: (key: DynamoDB.Key) =>
      createPromiseWrapperWithDelay(delay, () => ({
        Item: {
          email: key.email,
        },
      })),
  };
  return dbClientDouble as unknown as DynamoDB.DocumentClient;
}
