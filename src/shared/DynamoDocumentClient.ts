import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { IDocumentClient } from "./IDocumentClient";

export class DynamoDocumentClient implements IDocumentClient {
  constructor(private dbDocumentClient: DynamoDBDocumentClient) {}

  async get({
    Key,
    TableName,
  }: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<{ Item?: Record<string, unknown> }> {
    return await this.dbDocumentClient.send(
      new GetCommand({
        TableName: TableName,
        Key: Key,
      })
    );
  }
  async update({
    TableName,
    Key,
    UpdateExpression,
    ExpressionAttributeValues,
  }: {
    Key: Record<string, any>;
    TableName: string;
    UpdateExpression: string;
    ExpressionAttributeValues: Record<string, any>;
  }): Promise<void> {
    await this.dbDocumentClient.send(
      new UpdateCommand({
        TableName,
        Key,
        UpdateExpression,
        ExpressionAttributeValues,
      })
    );
  }
  async delete({
    Key,
    TableName,
  }: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<void> {
    await this.dbDocumentClient.send(
      new DeleteCommand({
        TableName: TableName,
        Key: Key,
      })
    );
  }
}
