import { JwtVerifier } from "./JwtVerifier";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { JwtFilterRules } from "./JwtFilterRules";

export class JwtFilter {
  private readonly _jwtVerifier: JwtVerifier;

  constructor({ jwtVerifier }: { jwtVerifier: JwtVerifier }) {
    this._jwtVerifier = jwtVerifier;
  }

  public async apply(
    event: APIGatewayProxyEvent,
    rules: JwtFilterRules,
    action: () => Promise<APIGatewayProxyResult>
  ): Promise<APIGatewayProxyResult> {
    const authorizationHeader = event.headers["authorization"];
    if (!authorizationHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: `Missing authorization header`,
        }),
      };
    }
    const authorizationHeaderMatch = /^Bearer\s+(.+)$/i.exec(
      authorizationHeader
    );
    if (!authorizationHeaderMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: `Invalid authorization header`,
        }),
      };
    }

    const token = authorizationHeaderMatch[1];

    const verificationResult = this._jwtVerifier.verify(token);

    if (
      verificationResult.success &&
      (("allowAllSignedTokens" in rules && rules.allowAllSignedTokens) ||
        ("allowSuperUser" in rules &&
          rules.allowSuperUser &&
          verificationResult.value.isSuperUser) ||
        ("allowUserWithEmail" in rules &&
          rules.allowUserWithEmail &&
          verificationResult.value.dopplerUserEmail ===
            rules.allowUserWithEmail))
    ) {
      return await action();
    } else if (verificationResult.success) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: `Not authorized`,
        }),
      };
    } else if (
      verificationResult.success === false &&
      verificationResult.error instanceof TokenExpiredError
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: `Expired token (${verificationResult.error.expiredAt.toISOString()})`,
        }),
      };
    } else if (
      verificationResult.success === false &&
      verificationResult.error instanceof JsonWebTokenError
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: `Invalid token: ${verificationResult.error.message}`,
        }),
      };
    } else {
      console.error(verificationResult);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unexpected error`,
        }),
      };
    }
  }
}
