import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserService, getJwtFilter } from "./compositionRoot";

const userService = getUserService();
const jwtFilter = getJwtFilter();

export const getUser: APIGatewayProxyHandler = async (event) =>
  jwtFilter.apply(
    event,
    { allowSuperUser: true, allowUserWithEmail: event.pathParameters["email"] },
    async () => {
      const result = await userService.get(event.pathParameters["email"]);

      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }
  );
