import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserService, getJwtFilter } from "./compositionRoot";

const userService = getUserService();
const jwtFilter = getJwtFilter();

export const firstStepsClosedSince: APIGatewayProxyHandler = async (event) =>
  jwtFilter.apply(
    event,
    {
      allowSuperUser: true,
      allowUserWithEmail: event.pathParameters["email"],
    },
    async () => {
      const now = new Date();

      await userService.registerFirstStepsClosedSince(
        event.pathParameters["email"],
        now
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `First steps closed registered at ${now}`,
        }),
      };
    }
  );
