
// app.ts
import compression from "compression";
import cors from "cors";
import express from "express";
import cookieParser from 'cookie-parser';
import { router } from "./app/modules/routes";
import path from "path";
import { envVars } from "./app/config/env";
const app = express();

import passport from "passport";
import "./app/config/passport"; 
// Middleware
app.use(cors()); 
app.use(compression()); 
app.use(express.json()); 
app.use(cookieParser());
app.use(passport.initialize());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(
  cors({
    origin: [envVars.FRONTEND_URL as string],
    credentials: true,
  })
);
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);

// Default route for testing
app.get("/", (_req, res) => {
  res.send("API is running");
});


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;