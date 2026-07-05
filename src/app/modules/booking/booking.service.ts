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

const getBookedSeats = async (busName: string): Promise<string[]> => {
  if (!busName) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Bus name is required");
  }

  const [rows]: any = await db.query(
    `SELECT seat_number
     FROM seats
     WHERE bus_name = ? AND is_booked = TRUE
     ORDER BY seat_number ASC`,
    [busName],
  );

  return rows.map((row: { seat_number: string }) => row.seat_number);
};

const getMyBookingsService = async (userId: number) => {
  const [rows]: any = await db.query(
    `
    SELECT
      b.id,
      b.user_id,
      b.bus_name,
      b.seat_numbers,
      b.subtotal,
      b.total_amount,
      b.transaction_id,
      b.booking_status,
      b.payment_status,
      b.created_at,

      p.id AS payment_id,
      p.transaction_id AS payment_transaction_id,
      p.amount,
      p.payment_status AS payment_table_status,
      p.created_at AS payment_created_at

    FROM bookings b

    LEFT JOIN payments p
      ON b.id = p.booking_id

    WHERE b.user_id = ?

    ORDER BY b.created_at DESC
    `,
    [userId]
  );

  return rows.map((booking: any) => ({
    bookingId: booking.id,
    userId: booking.user_id,
    busName: booking.bus_name,
    seatNumbers:
      typeof booking.seat_numbers === "string"
        ? JSON.parse(booking.seat_numbers)
        : booking.seat_numbers,

    subtotal: Number(booking.subtotal),
    totalAmount: Number(booking.total_amount),
    transactionId: booking.transaction_id,
    bookingStatus: booking.booking_status,
    bookingDate: booking.created_at,

    payment: {
      paymentId: booking.payment_id,
      transactionId: booking.payment_transaction_id,
      amount: booking.amount ? Number(booking.amount) : Number(booking.total_amount),
      paymentStatus:
        booking.payment_table_status ?? booking.payment_status,
      paymentDate: booking.payment_created_at,
    },
  }));
};

const getAllBookingsService = async () => {
  const [rows]: any = await db.query(`
SELECT
    b.id AS booking_id,
    b.bus_name,
    b.seat_numbers,
    b.subtotal,
    b.total_amount,
    b.transaction_id,
    b.booking_status,
    b.payment_status,
    b.created_at,
    u.id AS user_id,
    u.name,
    u.email
FROM bookings b
JOIN users u
ON b.user_id = u.id
ORDER BY b.created_at DESC
`);

  return rows.map((booking: any) => ({
    bookingId: booking.booking_id,
    busName: booking.bus_name,
    seatNumbers: JSON.parse(booking.seat_numbers),
    subtotal: Number(booking.subtotal),
    totalAmount: Number(booking.total_amount),
    transactionId: booking.transaction_id,
    bookingStatus: booking.booking_status,
    bookingDate: booking.created_at,

    customer: {
      id: booking.user_id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
    },

    payment: {
      id: booking.payment_id,
      amount: Number(booking.total_amount),
      paymentStatus: booking.payment_status,
    },
  }));
};

const getDashboardStatisticsService = async () => {
  // Total Users
  const [users]: any = await db.query(`
    SELECT COUNT(*) AS totalUsers
    FROM users
    WHERE role = 'CUSTOMER'
  `);

  // Total Bookings
  const [bookings]: any = await db.query(`
    SELECT COUNT(*) AS totalBookings
    FROM bookings
  `);

  // Pending Bookings
  const [pending]: any = await db.query(`
    SELECT COUNT(*) AS pendingBookings
    FROM bookings
    WHERE booking_status = 'PENDING'
  `);

  // Completed Bookings
  const [completed]: any = await db.query(`
    SELECT COUNT(*) AS completedBookings
    FROM bookings
    WHERE booking_status = 'COMPLETED'
  `);

  // Cancelled Bookings
  const [cancelled]: any = await db.query(`
    SELECT COUNT(*) AS cancelledBookings
    FROM bookings
    WHERE booking_status = 'CANCELLED'
  `);

  // Today's Bookings
  const [todayBookings]: any = await db.query(`
    SELECT COUNT(*) AS todayBookings
    FROM bookings
    WHERE DATE(created_at) = CURDATE()
  `);

  // Total Revenue
  const [revenue]: any = await db.query(`
    SELECT
      IFNULL(SUM(total_amount),0) AS totalRevenue
    FROM bookings
    WHERE payment_status='PAID'
  `);

  // Today's Revenue
  const [todayRevenue]: any = await db.query(`
    SELECT
      IFNULL(SUM(total_amount),0) AS todayRevenue
    FROM bookings
    WHERE payment_status='PAID'
      AND DATE(created_at)=CURDATE()
  `);

  // Latest Bookings
  const [recentBookings]: any = await db.query(`
    SELECT
      b.id,
      u.name,
      u.email,
      b.bus_name,
      b.total_amount,
      b.booking_status,
      b.payment_status,
      b.created_at
    FROM bookings b
    JOIN users u
      ON b.user_id = u.id
    ORDER BY b.created_at DESC
    LIMIT 10
  `);

  return {
    totalUsers: users[0].totalUsers,
    totalBookings: bookings[0].totalBookings,
    pendingBookings: pending[0].pendingBookings,
    completedBookings: completed[0].completedBookings,
    cancelledBookings: cancelled[0].cancelledBookings,
    todayBookings: todayBookings[0].todayBookings,
    totalRevenue: Number(revenue[0].totalRevenue),
    todayRevenue: Number(todayRevenue[0].todayRevenue),
    recentBookings,
  };
};



export const BookingService = {
  createBookingService,
  getMyBookingsService,
  getBookedSeats,
  getAllBookingsService,
  getDashboardStatisticsService
};
