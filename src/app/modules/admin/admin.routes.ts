import express from "express";
import { AdminController } from "./admin.controller";
import { fileUploader } from "../../../utiles/fileUploader";
import { UserValidation } from "./admin.validations";

const router = express.Router();

// CREATE ADMIN
router.post(
  "/create-admin",
  fileUploader.singleUpload("file"),
  (req, _res, next) => {
    try {
      if (!req.body?.data) {
        throw new Error("Admin data missing");
      }

      const parsed = JSON.parse(req.body.data);

      req.body = UserValidation.createAdminValidationSchema.parse(parsed);

      next();
    } catch (error) {
      next(error);
    }
  },
  AdminController.createAdmin
);

// GET ALL
router.get("/", AdminController.getAllAdmins);

// GET BY ID
router.get("/:id", AdminController.getAdminById);

// UPDATE
router.patch("/:id", AdminController.updateAdmin);

// HARD DELETE
router.delete("/:id", AdminController.deleteAdmin);

// SOFT DELETE
router.delete("/soft/:id", AdminController.softDeleteAdmin);

export const AdminRoutes = router;