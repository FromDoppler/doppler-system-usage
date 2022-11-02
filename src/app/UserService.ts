import { DynamoDB } from "aws-sdk";
import { User } from "./User";

export class UserService {
  private _userTableName: string;
  private _dbClient: DynamoDB.DocumentClient;

  constructor({
    userTableName,
    dbClient,
  }: {
    userTableName: string;
    dbClient: DynamoDB.DocumentClient;
  }) {
    this._userTableName = userTableName;
    this._dbClient = dbClient;
  }

  get: (email: string) => Promise<User | null> = async (email: string) => {
    const key = { email };
    const result = await this._dbClient
      .get({
        TableName: this._userTableName,
        Key: key,
      })
      .promise();

    const item = result.Item || key;
    return this.mapUser(item);
  };

  registerReportsSectionVisit = async (
    email: string,
    date: Date
  ): Promise<void> => {
    await this._dbClient
      .update({
        TableName: this._userTableName,
        Key: { email },
        UpdateExpression:
          "set reportsSectionLastVisit = :reportsSectionLastVisit",
        ExpressionAttributeValues: {
          ":reportsSectionLastVisit": date.toISOString(),
        },
      })
      .promise();
  };

  registerFirstStepsClosedSince = async (
    email: string,
    date: Date
  ): Promise<void> => {
    await this._dbClient
      .update({
        TableName: this._userTableName,
        Key: { email },
        UpdateExpression: "set firstStepsClosedSince = :firstStepsClosedSince",
        ExpressionAttributeValues: {
          ":firstStepsClosedSince": date.toISOString(),
        },
      })
      .promise();
  };

  private mapUser(item: DynamoDB.AttributeMap): User {
    return {
      email: item.email as string,
      reportsSectionLastVisit: (item.reportsSectionLastVisit as string) || null,
      firstStepsClosedSince: (item.firstStepsClosedSince as string) || null,
    };
  }
}
