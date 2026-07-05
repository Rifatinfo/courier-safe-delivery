
import { CookieOptions, Response } from "express";
import { envVars } from "../app/config/env";

type TokenInfo = {
  accessToken: string;
  refreshToken: string;
  accessTokenMaxAge?: number;
  refreshTokenMaxAge?: number;
};

const convertToMs = (time: string): number => {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1), 10);

  if (Number.isNaN(value)) {
    return 1000 * 60 * 60;
  }

  switch (unit) {
    case "y":
      return value * 365 * 24 * 60 * 60 * 1000;
    case "M":
      return value * 30 * 24 * 60 * 60 * 1000;
    case "w":
      return value * 7 * 24 * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    case "s":
      return value * 1000;
    default:
      return 1000 * 60 * 60;
  }
};

const getCookieOptions = (maxAge: number): CookieOptions => {
  const isProduction = envVars.NODE_ENV === "production";
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge,
  };

  if (envVars.COOKIE_DOMAIN) {
    options.domain = envVars.COOKIE_DOMAIN;
  }

  return options;
};

export const setAccessTokenCookie = (res: Response, accessToken: string, maxAge?: number) => {
  res.cookie(
    "accessToken",
    accessToken,
    getCookieOptions(maxAge ?? convertToMs(envVars.ACCESS_TOKEN_EXPIRY)),
  );
};

export const setAuthCookie = (res: Response, tokenInfo: TokenInfo) => {
  setAccessTokenCookie(res, tokenInfo.accessToken, tokenInfo.accessTokenMaxAge);

  res.cookie(
    "refreshToken",
    tokenInfo.refreshToken,
    getCookieOptions(
      tokenInfo.refreshTokenMaxAge ?? convertToMs(envVars.REFRESH_TOKEN_EXPIRY),
    ),
  );
};
