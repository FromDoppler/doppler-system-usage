import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UserService } from "./app/UserService";
import { createDummyDynamoDbDocumentClient } from "./app/DummyDbClient";
import { JwtFilter } from "./doppler-security/JwtFilter";
import { JwtVerifier } from "./doppler-security/JwtVerifier";
import { IDocumentClient } from "./shared/IDocumentClient";
import { DynamoDocumentClient } from "./shared/DynamoDocumentClient";

let _dbClientSingleton: IDocumentClient;
function getDbClientSingleton(): IDocumentClient {
  return (_dbClientSingleton =
    _dbClientSingleton ||
    (process.env.BEHAVIOR === "DUMMY"
      ? createDummyDynamoDbDocumentClient()
      : new DynamoDocumentClient(
          DynamoDBDocumentClient.from(new DynamoDBClient({}))
        )));
}

let _userServiceSingleton: UserService;
export function getUserService(): UserService {
  return (_userServiceSingleton =
    _userServiceSingleton ||
    new UserService({
      userTableName: process.env.DYNAMODB_USER_TABLE,
      dbClient: getDbClientSingleton(),
    }));
}

let _jwtVerifierSingleton: JwtVerifier;
function getJwtVerifier(): JwtVerifier {
  return (_jwtVerifierSingleton =
    _jwtVerifierSingleton ||
    new JwtVerifier({ publicKey: process.env.JWT_PUBLIC_KEY }));
}

let _jwtFilterSingleton: JwtFilter;
export function getJwtFilter(): JwtFilter {
  return (_jwtFilterSingleton =
    _jwtFilterSingleton || new JwtFilter({ jwtVerifier: getJwtVerifier() }));
}
