
import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from './auth.controller';
import passport from '../../config/passport';
import { envVars } from '../../config/env';





const router = express.Router();

router.get(
    "/me",
    AuthController.getMe
)

router.post(
    "/login",
    AuthController.login
)

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.get(
  "/google",
  (req, res, next) => {
    const state = (req.query.redirect as string) || "/";

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state,
      session: false,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      `${envVars.FRONTEND_URL}/login?error=auth_failed`,
    session: false,
  }),
  AuthController.googleCallbackController
);




export const AuthRoutes = router;