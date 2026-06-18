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
  };
};

export const envVars = loadEnvVariable();


