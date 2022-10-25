import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserService, getJwtFilter } from "./compositionRoot";

const userService = getUserService();
const jwtFilter = getJwtFilter();

export const visitReportsSection: APIGatewayProxyHandler = async (event) =>
  jwtFilter.apply(
    event,
    { allowSuperUser: true, allowUserWithEmail: event.pathParameters["email"] },
    async () => {
      const now = new Date();

      await userService.registerReportsSectionVisit(
        event.pathParameters["email"],
        now
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Visit registered at ${now}`,
        }),
      };
    }
  );
