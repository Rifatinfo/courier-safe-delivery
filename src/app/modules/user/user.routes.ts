import express from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./validation";


const router = express.Router();
router.post(
  "/create-customer",
  (req, res, next) => {
    try {
      req.body =
        UserValidation.createUserValidationSchema.parse(req.body);

      next();
    } catch (error) {
      next(error);
    }
  },
  UserController.createCustomer
);

router.get("/", UserController.getAllUsers);

export const UserRoutes = router;
