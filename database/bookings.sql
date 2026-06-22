USE delivery;
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  bus_name VARCHAR(100),
  seat_numbers JSON,
  subtotal DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  booking_status VARCHAR(20) DEFAULT 'PENDING',
  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  transaction_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);


