USE delivery;
CREATE TABLE seats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bus_name VARCHAR(100),
  seat_number VARCHAR(10),
  is_booked BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO seats (bus_name, seat_number, price, is_booked)
VALUES
('Greenline Paribahan', 'A1', 500, FALSE),
('Greenline Paribahan', 'A2', 500, FALSE),
('Greenline Paribahan', 'A3', 500, FALSE),
('Greenline Paribahan', 'A4', 500, FALSE),

('Greenline Paribahan', 'B1', 500, FALSE),
('Greenline Paribahan', 'B2', 500, FALSE),
('Greenline Paribahan', 'B3', 500, FALSE),
('Greenline Paribahan', 'B4', 500, FALSE),

('Greenline Paribahan', 'C1', 500, FALSE),
('Greenline Paribahan', 'C2', 500, FALSE),
('Greenline Paribahan', 'C3', 500, FALSE),
('Greenline Paribahan', 'C4', 500, FALSE),

('Greenline Paribahan', 'D1', 500, FALSE),
('Greenline Paribahan', 'D2', 500, FALSE),
('Greenline Paribahan', 'D3', 500, FALSE),
('Greenline Paribahan', 'D4', 500, FALSE),

('Greenline Paribahan', 'E1', 500, FALSE),
('Greenline Paribahan', 'E2', 500, FALSE),
('Greenline Paribahan', 'E3', 500, FALSE),
('Greenline Paribahan', 'E4', 500, FALSE);