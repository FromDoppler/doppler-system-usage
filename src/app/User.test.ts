import { DynamoDB } from "aws-sdk";
import { createPromiseWrapper } from "../shared/utils";
import { UserService } from "./UserService";

describe(UserService.name, () => {
  describe("get", () => {
    it("Should pass the right key to db", async () => {
      // Arrange
      const { dbClientDouble, TableName, sut } = createTestContext();

      // Act
      await sut.get("email1");

      // Assert
      expect(dbClientDouble.get).toHaveBeenCalledWith({
        Key: { email: "email1" },
        TableName,
      });
    });

    it("Should return a empty object when the item does not exist", async () => {
      // Arrange
      const { sut } = createTestContext();

      // Act
      const result = await sut.get("email1");

      // Assert
      expect(result).toEqual({
        email: "email1",
        reportsSectionLastVisit: null,
        firstStepsClosedSince: null,
      });
    });

    it("Should return map the resulting item", async () => {
      // Arrange
      const { dbClientDouble, sut } = createTestContext();
      dbClientDouble.get.mockImplementation(() =>
        createPromiseWrapper(() => ({
          Item: { email: "email1", name: "name1" },
        }))
      );

      // Act
      const result = await sut.get("email1");

      // Assert
      expect(result).toEqual({
        email: "email1",
        reportsSectionLastVisit: null,
        firstStepsClosedSince: null,
      });
    });
  });

  describe("registerVisit", () => {
    it("Should pass the right data to db", async () => {
      // Arrange
      const date = new Date("Date Mon Oct 24 2022 17:21:08 GMT-0300");
      const expectedValue = "2022-10-24T20:21:08.000Z";
      const { dbClientDouble, TableName, sut } = createTestContext();

      // Act
      await sut.registerReportsSectionVisit("email1", date);

      // Assert
      expect(dbClientDouble.update).toHaveBeenCalledWith({
        TableName,
        Key: { email: "email1" },
        UpdateExpression:
          "set reportsSectionLastVisit = :reportsSectionLastVisit",
        ExpressionAttributeValues: {
          ":reportsSectionLastVisit": expectedValue,
        },
      });
    });
  });

  describe("firstStepsClosedSince", () => {
    it("Should pass the right data to db", async () => {
      // Arrange
      const date = new Date("Date Wed Nov 02 2022 16:00:00 GMT-0300");
      const expectedValue = "2022-11-02T19:00:00.000Z";
      const { dbClientDouble, TableName, sut } = createTestContext();

      // Act
      await sut.registerFirstStepsClosedSince("email1", date);

      // Assert
      expect(dbClientDouble.update).toHaveBeenCalledWith({
        TableName,
        Key: { email: "email1" },
        UpdateExpression: "set firstStepsClosedSince = :firstStepsClosedSince",
        ExpressionAttributeValues: {
          ":firstStepsClosedSince": expectedValue,
        },
      });
    });
  });
});

function createTestContext() {
  const dbClientDouble = {
    update: jest.fn(() => createPromiseWrapper()),
    get: jest.fn(() => createPromiseWrapper(() => ({ Item: undefined }))),
  };
  const userTableName = "userTableName";
  const sut = new UserService({
    userTableName,
    dbClient: dbClientDouble as unknown as DynamoDB.DocumentClient,
  });
  return { dbClientDouble, TableName: userTableName, sut };
}
