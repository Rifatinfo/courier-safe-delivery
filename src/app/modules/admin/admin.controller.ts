import { Request, Response } from "express";
import { AdminService } from "./admin.service";

// CREATE
const createAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.createAdmin(req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: result,
  });
};

// GET ALL
const getAllAdmins = async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmins();

  res.status(200).json({
    success: true,
    message: "Admins fetched successfully",
    data: result,
  });
};

// GET BY ID
const getAdminById = async (req: Request, res: Response) => {
  const result = await AdminService.getAdminById(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: "Admin fetched successfully",
    data: result,
  });
};

// UPDATE
const updateAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdmin(
    Number(req.params.id),
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
};

// DELETE
const deleteAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.deleteAdmin(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
};

// SOFT DELETE
const softDeleteAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.softDeleteAdmin(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: "Admin soft deleted successfully",
    data: result,
  });
};

export const AdminController = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};