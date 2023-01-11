import { DynamoDocumentClient } from "src/shared/DynamoDocumentClient";
import { User } from "./User";

export class UserService {
  private _userTableName: string;
  private _dbClient: DynamoDocumentClient;

  constructor({
    userTableName,
    dbClient,
  }: {
    userTableName: string;
    dbClient: DynamoDocumentClient;
  }) {
    this._userTableName = userTableName;
    this._dbClient = dbClient;
  }

  get: (email: string) => Promise<User | null> = async (email: string) => {
    const key = { email };

    const result = await this._dbClient.get({
      TableName: this._userTableName,
      Key: key,
    });

    const item = result.Item || { email };
    return this.mapUser(item as Record<string, unknown>);
  };

  registerReportsSectionVisit = async (
    email: string,
    date: Date
  ): Promise<void> => {
    await this._dbClient.update({
      TableName: this._userTableName,
      Item: {
        email,
      },
      UpdateExpression:
        "set reportsSectionLastVisit = :reportsSectionLastVisit",
      ExpressionAttributeValues: {
        ":reportsSectionLastVisit": date.toISOString(),
      },
    });
  };

  registerFirstStepsClosedSince = async (
    email: string,
    date: Date
  ): Promise<void> => {
    await this._dbClient.update({
      TableName: this._userTableName,
      Item: {
        email,
      },
      UpdateExpression: "set firstStepsClosedSince = :firstStepsClosedSince",
      ExpressionAttributeValues: {
        ":firstStepsClosedSince": date.toISOString(),
      },
    });
  };

  deleteFlags = async (email: string): Promise<void> => {
    await this._dbClient.delete({
      TableName: this._userTableName,
      Key: {
        email,
      },
    });
  };

  private mapUser(item: Record<string, unknown>): User {
    return {
      email: item.email as string,
      reportsSectionLastVisit: (item.reportsSectionLastVisit as string) || null,
      firstStepsClosedSince: (item.firstStepsClosedSince as string) || null,
    };
  }
}
