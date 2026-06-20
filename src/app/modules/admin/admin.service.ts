import bcrypt from "bcryptjs";
import { db } from "../../config/db";

// CREATE ADMIN
const createAdmin = async (payload: any, file?: any) => {
  const { name, email, password } = payload;

  const [existing]: any = await db.query(
    "SELECT * FROM admins WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ image path from uploader
  const avatar = file?.path || null;

  const [result]: any = await db.query(
    `INSERT INTO admins (name, email, password, role, avatar)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, "ADMIN", avatar]
  );

  return {
    id: result.insertId,
    name,
    email,
    avatar,
    role: "ADMIN",
  };
};

// GET ALL ADMINS
const getAllAdmins = async () => {
  const [rows]: any = await db.query(
    `SELECT id, name, email, role, is_deleted, created_at
     FROM admins
     WHERE is_deleted = FALSE`
  );

  return rows;
};

// GET BY ID
const getAdminById = async (id: number) => {
  const [rows]: any = await db.query(
    `SELECT id, name, email, role, is_deleted, created_at
     FROM admins
     WHERE id = ? AND is_deleted = FALSE`,
    [id]
  );

  return rows[0];
};

// UPDATE ADMIN
const updateAdmin = async (id: number, payload: any) => {
  const { name, email } = payload;

  await db.query(
    `UPDATE admins SET name = ?, email = ?
     WHERE id = ? AND is_deleted = FALSE`,
    [name, email, id]
  );

  return { id, name, email };
};

// HARD DELETE
const deleteAdmin = async (id: number) => {
  await db.query(`DELETE FROM admins WHERE id = ?`, [id]);

  return { message: "Admin deleted permanently" };
};

// SOFT DELETE
const softDeleteAdmin = async (id: number) => {
  await db.query(
    `UPDATE admins SET is_deleted = TRUE WHERE id = ?`,
    [id]
  );

  return { message: "Admin soft deleted" };
};

export const AdminService = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};