import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookingService } from "./booking.service";


 const createBookingController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);
    if (!req.user?.id || Number.isNaN(userId)) {
      throw new Error("User ID is required");
    }

    const result = await BookingService.createBookingService({
      userId,
      payload: req.body,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  }
);

export const BookingController = {
  createBookingController,
};