import bcrypt from "bcryptjs";
import { db } from "../../config/db";

const createCustomer = async (payload: any) => {
  const { name, email, password } = payload;

  const [existingUser]: any = await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
  );

  if (existingUser.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result]: any = await db.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password,
      role
    )
    VALUES (?, ?, ?, ?)
    `,
    [name, email, hashedPassword, "CUSTOMER"],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};
  const getAllUsers = async () => {
    const [rows]: any = await db.query(
      "SELECT * FROM users",
    );

    return rows;
  };
export const UserService = {
  createCustomer,
   getAllUsers,
};
