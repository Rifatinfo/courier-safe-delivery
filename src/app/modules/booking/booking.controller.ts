import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookingService } from "./booking.service";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const getBookedSeatsController = catchAsync(
  async (req: Request, res: Response) => {
    const busName = req.query.busName || 'Greenline Paribahan';

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

const getMyBookingsController = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    if (!req.user?.id || Number.isNaN(userId)) {
      throw new Error("User ID is required");
    }

    const result = await BookingService.getMyBookingsService(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  }
);

const getAllBookingsController = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await BookingService.getAllBookingsService();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All bookings retrieved successfully",
      data: result,
    });
  }
);


const getDashboardStatisticsController = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await BookingService.getDashboardStatisticsService();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: result,
    });
  }
);

export const BookingController = {
  getBookedSeatsController,
  createBookingController,
  getMyBookingsController,
  getAllBookingsController,
  getDashboardStatisticsController
};


