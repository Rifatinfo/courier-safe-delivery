import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { jwtHelper } from "../../../helpers/jwtHelpers";
import { Secret } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { db } from "../../config/db";

const convertToMs = (time: string): number => {
  const unit = time.slice(-1);
  const value = parseInt(time.slice(0, -1));

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
      return 1000 * 60 * 60; // default 1h
  }
};

const login = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const accessTokenExpiresIn = envVars.ACCESS_TOKEN_EXPIRY as string;
  const refreshTokenExpiresIn = envVars.REFRESH_TOKEN_EXPIRY as string;
  // 1️ check USERS table
  const [userRows]: any = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
  );

  let account = userRows[0];
  let table = "user";

  // 2️ if not found → check ADMINS table
  if (!account) {
    const [adminRows]: any = await db.query(
      "SELECT * FROM admins WHERE email = ? AND is_deleted = FALSE",
      [email],
    );

    account = adminRows[0];
    table = "admin";
  }

  // 3️ if still not found
  if (!account) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Account not found!");
  }

  // 4️ check password
  const isCorrectPassword = await bcrypt.compare(password, account.password);

  if (!isCorrectPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
  }

  // 5️ generate tokens
  const accessToken = jwt.sign(
    {
      id: account.id, // ✅ add this
      email: account.email,
      role: account.role,
      type: table,
    },
    envVars.JWT_SECRET as string,
    { expiresIn: envVars.JWT_SECRET_EXPIRES_IN as any },
  );

  const refreshToken = jwt.sign(
    {
      id: account.id, // ✅ add this
      email: account.email,
      role: account.role,
      type: table,
    },
    envVars.REFRESH_TOKEN_SECRET as string,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN as any },
  );

  return {
    accessToken,
    refreshToken,
    accessTokenMaxAge: convertToMs(accessTokenExpiresIn),
    refreshTokenMaxAge: convertToMs(refreshTokenExpiresIn),
    role: account.role,
    type: table, // user or admin
    needPasswordChange: account.needPasswordChange || false,
  };
};

const refreshToken = async (token: string) => {
  let decodedData: any;

  // 1️ Verify token
  try {
    decodedData = jwtHelper.verifyToken(
      token,
      envVars.REFRESH_TOKEN_SECRET as Secret,
    );
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  const { email, type } = decodedData;

  let account: any;

  // 2️ Check USER table
  if (type === "user") {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    account = rows[0];
  }

  // 3️ Check ADMIN table
  if (type === "admin") {
    const [rows]: any = await db.query(
      "SELECT * FROM admins WHERE email = ? AND is_deleted = FALSE",
      [email],
    );

    account = rows[0];
  }

  // 4️ If not found
  if (!account) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found!");
  }

  // 5️ Optional status check (only if you have it)
  if (account.status && account.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Account is not active");
  }

  // 6️ Generate new access token
  const accessTokenExpiresIn = envVars.JWT_SECRET_EXPIRES_IN as string;

  const accessToken = jwtHelper.generateToken(
    {
      email: account.email,
      role: account.role,
      id: account.id,
      type,
    },
    envVars.JWT_SECRET as Secret,
    accessTokenExpiresIn,
  );

  return {
    accessToken,
    accessTokenMaxAge: convertToMs(accessTokenExpiresIn),
    needPasswordChange: account.needPasswordChange || false,
  };
};
const getMe = async (session: any) => {
  const accessToken = session.accessToken;

  // 1️ verify token
  let decodedData: any;

  try {
    decodedData = jwtHelper.verifyToken(
      accessToken,
      envVars.JWT_SECRET as Secret,
    );
  } catch {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid token");
  }

  const { email, type } = decodedData;

  let user: any;

  // 2️ check USER table
  if (type === "user") {
    const [rows]: any = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
      [email],
    );

    user = rows[0];
  }

  // 3️ check ADMIN table
  if (type === "admin") {
    const [rows]: any = await db.query(
      `SELECT id, name, email, role, avatar, created_at 
       FROM admins 
       WHERE email = ? AND is_deleted = FALSE`,
      [email],
    );

    user = rows[0];
  }

  // 4️ not found
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

export const AuthService = {
  login,
  refreshToken,
  getMe,
};
