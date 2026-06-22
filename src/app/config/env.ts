// src/app/config/env.ts

import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  NODE_ENV: string;

  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRY: string;
  FRONTEND_URL: string;
  JWT_SECRET_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  BACKEND_URL: string;
  SSL_STORE_ID: string;
  SSL_STORE_PASS: string;
  SSL_PAYMENT_API: string;
  SSL_VALIDATION_API: string;
  SSL_SUCCESS_BACKEND_URL: string;
  SSL_FAIL_BACKEND_URL: string;
  SSL_CANCEL_BACKEND_URL: string;
  SSL_SUCCESS_FRONTEND_URL: string;
  SSL_FAIL_FRONTEND_URL: string;
  SSL_CANCEL_FRONTEND_URL: string;
  SSL_IPN_URL: string;
  ROUTER_API_KEY: string;
  GOOGLE_CLIENT_SECRET : string;
  GOOGLE_CLIENT_ID :  string;
}

const loadEnvVariable = (): EnvConfig => {
  const requiredEnvVariable: string[] = [
    "PORT",
    "NODE_ENV",
    "DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRES_IN",
    "FRONTEND_URL",
    "JWT_SECRET_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "BACKEND_URL",
    "SSL_STORE_ID",
    "SSL_STORE_PASS",
    "SSL_PAYMENT_API",
    "SSL_VALIDATION_API",
    "SSL_SUCCESS_BACKEND_URL",
    "SSL_FAIL_BACKEND_URL",
    "SSL_CANCEL_BACKEND_URL",
    "SSL_SUCCESS_FRONTEND_URL",
    "SSL_FAIL_FRONTEND_URL",
    "SSL_CANCEL_FRONTEND_URL",
    "SSL_IPN_URL",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_EXPIRY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET"
  ];

  // requiredEnvVariable.forEach((key) => {
  //   if (!process.env[key]) {
  //     throw new Error(`Missing required environment variable ${key}`);
  //   }
  // });

  requiredEnvVariable.forEach((key) => {
    if (process.env[key] === undefined) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as string,
    DB_HOST: process.env.DB_HOST as string,
    DB_PORT: process.env.DB_PORT as string,
    DB_USER: process.env.DB_USER as string,
    DB_PASSWORD: process.env.DB_PASSWORD || "",
    DB_NAME: process.env.DB_NAME as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    JWT_SECRET_EXPIRES_IN: process.env.JWT_SECRET_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
     SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SMTP_FROM: process.env.SMTP_FROM as string,
    ROUTER_API_KEY : process.env.ROUTER_API_KEY as string,
    BACKEND_URL: process.env.BACKEND_URL as string,
    SSL_STORE_ID: process.env.SSL_STORE_ID as string,
    SSL_STORE_PASS: process.env.SSL_STORE_PASS as string,
    SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,
    SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,
    SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL as string,
    SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,
    SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL as string,
    SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL as string,
    SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,
    SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL as string,
    SSL_IPN_URL: process.env.SSL_IPN_URL as string,
    GOOGLE_CLIENT_SECRET  : process.env.GOOGLE_CLIENT_SECRET as  string,
    GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID as string,
  };
};

export const envVars = loadEnvVariable();


