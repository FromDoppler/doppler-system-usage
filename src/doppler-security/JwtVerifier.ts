import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { Result } from "src/shared/result-types";
import { TokenData } from "./TokenData";
import { verify } from "jsonwebtoken";

export class JwtVerifier {
  private readonly _publicKey: string;

  constructor({ publicKey }: { publicKey: string }) {
    this._publicKey = publicKey;
  }

  public verify(token: string): Result<TokenData, JsonWebTokenError> {
    try {
      const payload = verify(token, this._publicKey, { complete: false });

      if (!payload["exp"]) {
        return { success: false, error: new JsonWebTokenError("exp required") };
      }

      return { success: true, value: this.mapTokenData(payload) };
    } catch (error) {
      return { success: false, error };
    }
  }

  private mapTokenData(payload: JwtPayload | string): TokenData {
    return {
      isSuperUser: payload["isSU"] === true,
      dopplerUserId:
        typeof payload["nameid"] === "number" ? payload["nameid"] : null,
      dopplerUserEmail:
        typeof payload["unique_name"] === "string" && payload["unique_name"]
          ? payload["unique_name"]
          : null,
    };
  }
}
