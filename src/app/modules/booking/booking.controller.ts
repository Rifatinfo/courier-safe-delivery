import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookingService } from "./booking.service";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const getBookedSeatsController = catchAsync(
  async (req: Request, res: Response) => {
    const busName = req.query.busName;

    if (typeof busName !== "string" || !busName.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Bus name is required");
    }

    const result = await BookingService.getBookedSeats(busName.trim());

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Booked seats retrieved successfully",
      data: result,
    });
  },
);

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
  getBookedSeatsController,
  createBookingController,
};
