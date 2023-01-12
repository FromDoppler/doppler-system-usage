export interface IDocumentClient {
  get(parameters: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<{ Item?: Record<string, unknown> }>;
  update(parameters: {
    Key: Record<string, any>;
    TableName: string;
    UpdateExpression: string;
    ExpressionAttributeValues: Record<string, any>;
  }): Promise<void>;
  delete(parameters: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<void>;
}
