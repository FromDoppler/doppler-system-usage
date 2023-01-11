import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
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
  }): Promise<Record<string, unknown>> {
    return await this.dbDocumentClient.send(
      new GetCommand({
        TableName: TableName,
        Key: Key,
      })
    );
  }
  async update({
    TableName,
    Item,
    UpdateExpression,
    ExpressionAttributeValues,
  }: {
    Item: Record<string, any>;
    TableName: string;
    UpdateExpression: string;
    ExpressionAttributeValues: Record<string, any>;
  }): Promise<void> {
    await this.dbDocumentClient.send(
      new PutCommand({
        TableName: TableName,
        Item: Item,
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
