import { envVars } from "../app/config/env";
import { jwtHelper } from "../helpers/jwtHelpers";

type UserPayload = {
  id: number;
  email: string;
  role: string;
  type?: "user" | "admin";
};

export const createUserTokens = (user: UserPayload) => {
  const payload: UserPayload = {
    id: user.id,
    role: user.role,
    email: user.email,
    type: user.type,
  };
   console.log("PAYLOAD:", payload);
  const accessToken = jwtHelper.generateToken(
    payload,
    envVars.JWT_SECRET as string,
    envVars.ACCESS_TOKEN_EXPIRY as string
  );

  const refreshToken = jwtHelper.generateToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET as string,
    envVars.REFRESH_TOKEN_EXPIRY as string
  );

  return {
    accessToken,
    refreshToken,
  };
};