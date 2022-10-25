import { APIGatewayProxyEvent } from "aws-lambda";
import { JwtFilter } from "./JwtFilter";
import { JwtVerifier } from "./JwtVerifier";
import { developmentPubKey, testDataTokens } from "./test-data";

describe(JwtFilter.name, () => {
  describe.each([
    {
      tokenName: "token_Expire2033_05_18",
      jwtFilterRules: { allowAllSignedTokens: true } as const,
    },
    {
      tokenName: "token_Superuser_Expire2033_05_18",
      jwtFilterRules: { allowAllSignedTokens: true } as const,
    },
    {
      tokenName: "token_Superuser_Expire2033_05_18",
      jwtFilterRules: { allowSuperUser: true } as const,
    },
    {
      tokenName: "token_Superuser_Expire2033_05_18",
      jwtFilterRules: {
        allowUserWithEmail: "test1@test.com",
        allowSuperUser: true,
      } as const,
    },
    {
      tokenName: "token_SuperuserFalse_Expire2033_05_18",
      jwtFilterRules: { allowAllSignedTokens: true } as const,
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      jwtFilterRules: { allowAllSignedTokens: true } as const,
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      jwtFilterRules: { allowUserWithEmail: "test1@test.com" } as const,
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      jwtFilterRules: {
        allowUserWithEmail: "test1@test.com",
        allowSuperUser: true,
      } as const,
    },
  ])("apply (successful)", ({ tokenName, jwtFilterRules }) => {
    const token = testDataTokens[tokenName];
    const jwtVerifier = new JwtVerifier({ publicKey: developmentPubKey });

    it(`Apply should pass for ${tokenName}`, async () => {
      const sut = new JwtFilter({ jwtVerifier });
      const result = await sut.apply(
        {
          headers: { authorization: `bearer ${token}` },
        } as unknown as APIGatewayProxyEvent,
        jwtFilterRules,
        async () => {
          return {
            statusCode: 200,
            body: "body",
          };
        }
      );
      expect(result).toEqual({
        statusCode: 200,
        body: "body",
      });
    });
  });

  describe.each([
    {
      tokenName: "token_Expire2033_05_18",
      jwtFilterRules: { allowSuperUser: true } as const,
    },
    {
      tokenName: "token_Superuser_Expire2033_05_18",
      jwtFilterRules: { allowUserWithEmail: "otro@test.com" } as const,
    },
    {
      tokenName: "token_SuperuserFalse_Expire2033_05_18",
      jwtFilterRules: { allowSuperUser: true } as const,
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      jwtFilterRules: { allowSuperUser: true } as const,
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      jwtFilterRules: { allowUserWithEmail: "otro@test.com" } as const,
    },
  ])("apply (fail permissions)", ({ tokenName, jwtFilterRules }) => {
    const token = testDataTokens[tokenName];
    const jwtVerifier = new JwtVerifier({ publicKey: developmentPubKey });

    it(`Apply fail for ${tokenName}`, async () => {
      const sut = new JwtFilter({ jwtVerifier });
      const result = await sut.apply(
        {
          headers: { authorization: `bearer ${token}` },
        } as unknown as APIGatewayProxyEvent,
        jwtFilterRules,
        async () => {
          return {
            statusCode: 200,
            body: "body",
          };
        }
      );
      expect(result).toEqual({
        statusCode: 403,
        body: `{"message":"Not authorized"}`,
      });
    });
  });

  describe.each([
    {
      tokenName: "token_Empty",
      expectedStatus: 401,
      expectedMessage: "Invalid token: exp required",
    },
    {
      tokenName: "token_Broken",
      expectedStatus: 401,
      expectedMessage: "Invalid token: invalid token",
    },
    {
      tokenName: "token_Expire2001_09_08",
      expectedStatus: 401,
      expectedMessage: "Expired token (2001-09-09T01:46:40.000Z)",
    },
    {
      tokenName: "token_Superuser_Expire2001_09_08",
      expectedStatus: 401,
      expectedMessage: "Expired token (2001-09-09T01:46:40.000Z)",
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2001_09_08",
      expectedStatus: 401,
      expectedMessage: "Expired token (2001-09-09T01:46:40.000Z)",
    },
  ])("verify (failed)", ({ tokenName, expectedStatus, expectedMessage }) => {
    const token = testDataTokens[tokenName];
    const jwtVerifier = new JwtVerifier({ publicKey: developmentPubKey });

    it(`Apply should fail for ${tokenName}`, async () => {
      const sut = new JwtFilter({ jwtVerifier });
      const result = await sut.apply(
        {
          headers: { authorization: `bearer ${token}` },
        } as unknown as APIGatewayProxyEvent,
        { allowAllSignedTokens: true },
        async () => {
          return {
            statusCode: 200,
            body: "body",
          };
        }
      );
      expect(result).toEqual({
        statusCode: expectedStatus,
        body: `{"message":"${expectedMessage}"}`,
      });
    });
  });

  describe.each([
    {
      scenario: "no headers",
      headers: {},
      expectedStatus: 401,
      expectedMessage: "Missing authorization header",
    },
    {
      scenario: "empty authorization header",
      headers: { authorization: "" },
      expectedStatus: 401,
      expectedMessage: "Missing authorization header",
    },
    {
      scenario: "invalid authorization header",
      headers: { authorization: "invalid" },
      expectedStatus: 401,
      expectedMessage: "Invalid authorization header",
    },
  ])(
    "verify (bad headers)",
    ({ scenario, headers, expectedStatus, expectedMessage }) => {
      const jwtVerifier = new JwtVerifier({ publicKey: developmentPubKey });

      it(`Apply should fail for ${scenario}`, async () => {
        const sut = new JwtFilter({ jwtVerifier });
        const result = await sut.apply(
          { headers } as unknown as APIGatewayProxyEvent,
          { allowAllSignedTokens: true },
          async () => {
            return {
              statusCode: 200,
              body: "body",
            };
          }
        );
        expect(result).toEqual({
          statusCode: expectedStatus,
          body: `{"message":"${expectedMessage}"}`,
        });
      });
    }
  );
});
