export interface IDocumentClient {
  get(parameters: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<Record<string, unknown>>;
  update(parameters: {
    Item: Record<string, any>;
    TableName: string;
  }): Promise<void>;
  delete(parameters: {
    Key: Record<string, any>;
    TableName: string;
  }): Promise<void>;
}
