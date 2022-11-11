import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserService, getJwtFilter } from "./compositionRoot";

const userService = getUserService();
const jwtFilter = getJwtFilter();

export const deleteFlags: APIGatewayProxyHandler = async (event) =>
  jwtFilter.apply(
    event,
    {
      allowSuperUser: true,
    },
    async () => {
      await userService.deleteFlags(event.pathParameters["email"]);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Flags deleted.`,
        }),
      };
    }
  );
