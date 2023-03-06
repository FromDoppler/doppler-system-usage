import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

export interface IDocumentClient {
  get(parameters: {
    Key: Record<string, NativeAttributeValue>;
    TableName: string;
  }): Promise<{ Item?: Record<string, unknown> }>;
  update(parameters: {
    Key: Record<string, NativeAttributeValue>;
    TableName: string;
    UpdateExpression: string;
    ExpressionAttributeValues: Record<string, NativeAttributeValue>;
  }): Promise<void>;
  delete(parameters: {
    Key: Record<string, NativeAttributeValue>;
    TableName: string;
  }): Promise<void>;
}
