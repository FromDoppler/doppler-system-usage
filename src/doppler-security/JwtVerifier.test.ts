import { JwtVerifier } from "./JwtVerifier";
import { developmentPubKey, testDataTokens } from "./test-data";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

describe(JwtVerifier.name, () => {
  describe.each([
    {
      tokenName: "token_Expire2033_05_18",
      expectedResult: {
        success: true,
        value: {
          isSuperUser: false,
          dopplerUserId: null,
          dopplerUserEmail: null,
        },
      },
    },
    {
      tokenName: "token_Superuser_Expire2033_05_18",
      expectedResult: {
        success: true,
        value: {
          isSuperUser: true,
          dopplerUserId: null,
          dopplerUserEmail: null,
        },
      },
    },
    {
      tokenName: "token_SuperuserFalse_Expire2033_05_18",
      expectedResult: {
        success: true,
        value: {
          isSuperUser: false,
          dopplerUserId: null,
          dopplerUserEmail: null,
        },
      },
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2033_05_18",
      expectedResult: {
        success: true,
        value: {
          isSuperUser: false,
          dopplerUserId: 123,
          dopplerUserEmail: "test1@test.com",
        },
      },
    },
  ])("verify (successful)", ({ tokenName, expectedResult }) => {
    const token = testDataTokens[tokenName];
    it(`should decode ${tokenName}`, () => {
      const sut = new JwtVerifier({ publicKey: developmentPubKey });
      const result = sut.verify(token);
      expect(result).toEqual(expectedResult);
    });
  });

  describe.each([
    {
      tokenName: "token_Empty",
      expectedError: JsonWebTokenError,
      expectedMessage: "exp required",
    },
    {
      tokenName: "token_Broken",
      expectedError: JsonWebTokenError,
      expectedMessage: "invalid token",
    },
    {
      tokenName: "token_Expire2001_09_08",
      expectedError: TokenExpiredError,
      expectedMessage: "jwt expired",
    },
    {
      tokenName: "token_Superuser_Expire2001_09_08",
      expectedError: TokenExpiredError,
      expectedMessage: "jwt expired",
    },
    {
      tokenName: "token_Account_123_test1AtTestDotCom_Expire2001_09_08",
      expectedError: TokenExpiredError,
      expectedMessage: "jwt expired",
    },
  ])("verify (failed)", ({ tokenName, expectedError, expectedMessage }) => {
    const token = testDataTokens[tokenName];
    it(`should fail ${tokenName}`, () => {
      const sut = new JwtVerifier({ publicKey: developmentPubKey });
      const result = sut.verify(token);
      expect(result.success).toBe(false);
      expect(result.success === false && result.error).toBeInstanceOf(
        expectedError
      );
      expect(result.success === false && result.error.message).toBe(
        expectedMessage
      );
    });
  });
});
