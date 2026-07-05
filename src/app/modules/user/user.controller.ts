import { Request, Response } from "express";
import { UserService } from "./user.service";

const createCustomer = async (
  req: Request,
  res: Response
) => {
  const result = await UserService.createCustomer(req.body);

  res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    data: result,
  });
};

const getAllUsers = async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
};


export const UserController = {
  createCustomer,
  getAllUsers,
};
