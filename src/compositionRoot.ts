import { DynamoDB } from "aws-sdk";
import { UserService } from "./app/UserService";
import { createDummyDynamoDbClient } from "./app/DummyDbClient";
import { JwtFilter } from "./doppler-security/JwtFilter";
import { JwtVerifier } from "./doppler-security/JwtVerifier";

let _dbClientSingleton: DynamoDB.DocumentClient;
function getDbClientSingleton(): DynamoDB.DocumentClient {
  return (_dbClientSingleton =
    _dbClientSingleton ||
    (process.env.BEHAVIOR === "DUMMY"
      ? createDummyDynamoDbClient()
      : new DynamoDB.DocumentClient()));
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
