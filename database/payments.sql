
USE delivery;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  transaction_id VARCHAR(100) UNIQUE,

  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BDT',

  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  gateway_status VARCHAR(50),

  validation_id VARCHAR(100),
  bank_tran_id VARCHAR(100),

  card_type VARCHAR(50),
  card_issuer VARCHAR(100),

  payment_gateway_data JSON,

  invoice_url TEXT,

  paid_at TIMESTAMP NULL,
  failed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

