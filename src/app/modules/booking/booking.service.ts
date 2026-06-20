import { getTransactionId } from "../../../utiles/generateTransactionId";
import { db } from "../../config/db";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";

const createBookingService = async ({
  userId,
  payload,
}: {
  userId: number;
  payload: any;
}) => {
  const { busName, seats, name, phone, address } = payload;

  if (!seats || seats.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Select seats first");
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Lock and check seats
    const [seatRows]: any = await connection.query(
      `SELECT * FROM seats WHERE seat_number IN (?) AND bus_name = ? AND is_booked = FALSE FOR UPDATE`,
      [seats, busName],
    );
    console.log("Requested seats:", seats);
    console.log("Found seats:", seatRows);
    console.log("Found count:", seatRows.length);
    if (seatRows.length !== seats.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Some seats are unavailable, already booked, or do not exist",
      );
    }

    const price = Number(seatRows[0].price);
    const subtotal = price * seats.length;
    const totalAmount = subtotal;
    const transactionId = getTransactionId();

    // 2️⃣ Create booking
    const [result]: any = await connection.query(
      `INSERT INTO bookings 
       (user_id, bus_name, seat_numbers, subtotal, total_amount, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        busName,
        JSON.stringify(seats),
        subtotal,
        totalAmount,
        transactionId,
      ],
    );

    const bookingId = result.insertId;

    // 3️⃣ Mark seats as booked
    await connection.query(
      `UPDATE seats SET is_booked = TRUE WHERE seat_number IN (?) AND bus_name = ?`,
      [seats, busName],
    );

    // 4️⃣ Create payment record
    await connection.query(
      `INSERT INTO payments (booking_id, transaction_id, amount)
       VALUES (?, ?, ?)`,
      [bookingId, transactionId, totalAmount],
    );

    await connection.commit();
    const sslPayload: ISSLCommerz = {
      name,
      email: payload.email ?? "guest@example.com",
      phone,
      address,
      totalAmount,
      transactionId,
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    return {
      bookingId,
      transactionId,
      totalAmount,
      name,
      phone,
      address,
      paymentUrl: sslPayment.GatewayPageURL,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const BookingService = {
  createBookingService,
};
