import { RowDataPacket } from "mysql2";

declare global {
  namespace Express {
    interface User extends RowDataPacket {
      id: number;
      name: string;
      email: string;
      role: string;
    }
  }
}