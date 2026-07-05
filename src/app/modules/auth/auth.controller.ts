import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

import ApiError from "../../errors/ApiError";
import { AuthService } from "./auth.service";
import { envVars } from "../../config/env";
import { createUserTokens } from "../../../utiles/createUserTokens";
import { setAccessTokenCookie, setAuthCookie } from "../../../utiles/setAuthCookie";




const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    const {
        accessToken,
        refreshToken,
        accessTokenMaxAge,
        refreshTokenMaxAge,
        needPasswordChange,
    } = result;

    setAuthCookie(res, {
        accessToken,
        refreshToken,
        accessTokenMaxAge,
        refreshTokenMaxAge,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User Login Successfully!",
        data: {
            needPasswordChange,
        },
    });
});


const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/login`
      );
    }

    const tokenInfo = createUserTokens(user);

    setAuthCookie(res, tokenInfo);

    let redirectUrl =
      (req.query.state as string) || "/";

    if (redirectUrl.startsWith("/")) {
      redirectUrl = redirectUrl.slice(1);
    }

    res.redirect(
      `${envVars.FRONTEND_URL}/${redirectUrl}?loggedIn=true`
    );
  }
);



const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token missing!");
    }

    const result = await AuthService.refreshToken(token);
    setAccessTokenCookie(res, result.accessToken, result.accessTokenMaxAge);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Access token generated successfully!",
        data: {
            message: "Access token generated successfully!",
        },
    });
})
const getMe = catchAsync(async (req: Request, res: Response) => {
    const userSession = req.cookies;
    const result = await AuthService.getMe(userSession);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User retrieve successfully!",
        data: result,
    });
})



export const AuthController = {
    login,
    refreshToken,
    getMe,
    googleCallbackController
}
