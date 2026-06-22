import axios from "axios";
import httpStatus from "http-status-codes";
import { db } from "../../config/db";
import ApiError from "../../errors/ApiError";

import { ISSLCommerz } from "./sslCommerz.interface";
import { envVars } from "../../config/env";

const sslPaymentInit = async (payload: ISSLCommerz) => {
  try {
    const data = {
      store_id: envVars.SSL_STORE_ID,
      store_passwd: envVars.SSL_STORE_PASS,
      total_amount: payload.totalAmount,
      currency: "BDT",
      tran_id: payload.transactionId,

      success_url: `${envVars.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}`,
      fail_url: `${envVars.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}`,
      cancel_url: `${envVars.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}`,
      ipn_url: envVars.SSL_IPN_URL,

      shipping_method: "NO",
      product_name: "Bus Ticket",
      product_category: "Transport",
      product_profile: "general",

      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address,
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phone,

      ship_name: payload.name,
      ship_add1: payload.address,
      ship_city: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    const response = await axios.post(envVars.SSL_PAYMENT_API, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const validatePayment = async (payload: any) => {
  try {
    // ===================== 1 Call SSLCommerz validation API ====================== //
    const response = await axios.get(
      `${envVars.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${envVars.SSL_STORE_ID}&store_passwd=${envVars.SSL_STORE_PASS}`
    );

    const validationData = response.data;

    // ================== 2 Check payment status from SSL ================== //
    if (validationData.status !== "VALID") {
      throw new ApiError(400, "Payment validation failed");
    }

    // ================== 3 Find payment by transactionId ================== //
    const [rows]: any = await db.query(
      `SELECT * FROM payments WHERE transaction_id = ?`,
      [payload.tran_id]
    );

    const payment = rows[0];

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    // ============= 4 Update payment record ================ //
    await db.query(
      `UPDATE payments
       SET gateway_status = ?, validation_id = ?, bank_tran_id = ?,
           card_type = ?, card_issuer = ?, payment_gateway_data = ?
       WHERE id = ?`,
      [
        validationData.status,
        validationData.val_id,
        validationData.bank_tran_id,
        validationData.card_type,
        validationData.card_issuer,
        JSON.stringify(validationData),
        payment.id,
      ]
    );

    return {
      success: true,
      message: "Payment validated successfully",
    };
  } catch (error: any) {
    console.error(error);
    throw new ApiError(401, `Payment Validation Error: ${error.message}`);
  }
};

export const SSLService = {
  sslPaymentInit,
  validatePayment,
};