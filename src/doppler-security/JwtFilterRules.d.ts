export type JwtFilterRules =
  | {
      allowAllSignedTokens: true;
    }
  | {
      allowSuperUser: true;
    }
  | {
      allowUserWithEmail: string;
    }
  | {
      allowSuperUser: true;
      allowUserWithEmail: string;
    };
