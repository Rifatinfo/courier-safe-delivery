import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { envVars } from "../../config/env";


const successPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.successPayment(query);

  return res.redirect(
    `${envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&bookingId=${result.bookingId}&invoiceUrl=${result.invoiceUrl}&message=${result.message}&status=success`
  );
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.failPayment(query);

  return res.redirect(
    `${envVars.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&status=fail`
  );
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.cancelPayment(query);

  return res.redirect(
    `${envVars.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&status=cancel`
  );
});

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId); // ✅ convert to number

  const result = await PaymentService.initPayment(bookingId );
console.log("Payment initiation result:", result); // Log the result for debugging
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment initiated successfully",
    data: {
      gatewayUrl: result.paymentUrl, // IMPORTANT
    },
  });
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  await SSLService.validatePayment(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment Validated Successfully",
    data: null,
  });
});

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  validatePayment,
};