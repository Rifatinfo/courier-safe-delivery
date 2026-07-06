import { Router } from "express";
import { BookingController } from "./booking.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  "/booked-seats",
  BookingController.getBookedSeatsController,
);

// Protected Route
router.post(
  "/create-booking",
   auth("CUSTOMER"),
  BookingController.createBookingController    
  
);
router.get(
  "/my-bookings",
  auth("CUSTOMER", "ADMIN"),
  BookingController.getMyBookingsController
);

router.get(
  "/all-bookings",
  BookingController.getAllBookingsController
);
router.get(
  "/dashboard",
  BookingController.getDashboardStatisticsController
);
export const BookingRoutes = router;
