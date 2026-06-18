import { z } from "zod";

const createUserValidationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const UserValidation = {
  createUserValidationSchema,
};