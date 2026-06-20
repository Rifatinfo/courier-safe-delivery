import { StatusCodes } from "http-status-codes";
import { db } from "../../config/db";
import ApiError from "../../errors/ApiError";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";

/**===============================================
 *=============== SUCCESS PAYMENT =================
 =================================================*/
const successPayment = async (query: Record<string, string>) => {
  const { transactionId } = query;

  if (!transactionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID is required");
  }

  // ================= FIND PAYMENT + BOOKING ================= //
  const [paymentRows]: any = await db.query(
    `SELECT p.*, b.id AS booking_id, b.bus_name, b.seat_numbers, b.subtotal,
            b.total_amount, b.booking_status, b.user_id
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE p.transaction_id = ?`,
    [transactionId]
  );

  const payment = paymentRows[0];

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  // ================= ALREADY PAID (idempotency guard) ================= //
  if (payment.payment_status === "PAID") {
    return {
      success: true,
      message: "Payment already processed",
      bookingId: payment.booking_id,
      invoiceUrl: payment.invoice_url,
    };
  }

  // ================= MARK AS PAID (transaction) ================= //
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE payments SET payment_status = 'PAID', paid_at = NOW() WHERE id = ?`,
      [payment.id]
    );

    await connection.query(
      `UPDATE bookings SET payment_status = 'PAID', booking_status = 'CONFIRMED' WHERE id = ?`,
      [payment.booking_id]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  // Return immediately — invoice/email generation can be added later as background job
  return {
    success: true,
    message: "Payment processed successfully",
    bookingId: payment.booking_id,
    invoiceUrl: payment.invoice_url ?? null,
  };
};

/**===============================================
 *=============== FAIL PAYMENT =================
 =================================================*/
const failPayment = async (query: Record<string, string>) => {
  const { transactionId } = query;

  if (!transactionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID missing");
  }

  const [rows]: any = await db.query(
    `SELECT * FROM payments WHERE transaction_id = ?`,
    [transactionId]
  );

  const payment = rows[0];

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  if (payment.payment_status === "PAID") {
    return { success: false, message: "Payment already completed" };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE payments SET payment_status = 'FAILED', failed_at = NOW() WHERE id = ?`,
      [payment.id]
    );

    await connection.query(
      `UPDATE bookings SET payment_status = 'FAILED', booking_status = 'PENDING' WHERE id = ?`,
      [payment.booking_id]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { success: true, message: "Payment failed" };
};

/**===============================================
 *=============== CANCEL PAYMENT =================
 =================================================*/
const cancelPayment = async (query: Record<string, string>) => {
  const { transactionId } = query;

  if (!transactionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID missing");
  }

  const [rows]: any = await db.query(
    `SELECT * FROM payments WHERE transaction_id = ?`,
    [transactionId]
  );

  const payment = rows[0];

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Payment not found");
  }

  if (payment.payment_status === "PAID") {
    return { success: false, message: "Payment already completed" };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE payments SET payment_status = 'CANCELED', cancelled_at = NOW() WHERE id = ?`,
      [payment.id]
    );

    await connection.query(
      `UPDATE bookings SET payment_status = 'CANCELED', booking_status = 'PENDING' WHERE id = ?`,
      [payment.booking_id]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { success: true, message: "Payment cancelled" };
};

/**===============================================
 *=============== INIT PAYMENT =================
 =================================================*/
const initPayment = async (bookingId: number) => {
  const [rows]: any = await db.query(
    `SELECT b.*, p.*, u.email AS user_email
     FROM bookings b
     JOIN payments p ON p.booking_id = b.id
     LEFT JOIN users u ON u.id = b.user_id
     WHERE b.id = ?`,
    [bookingId]
  );

  const booking = rows[0];

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  const sslPayload: ISSLCommerz = {
    name: booking.name ?? "Passenger",
    email: booking.user_email ?? booking.email ?? "guest@example.com",
    phone: booking.phone ?? "01700000000",
    address: booking.address ?? "Dhaka",
    totalAmount: Number(booking.amount),
    transactionId: booking.transaction_id,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};

export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
};