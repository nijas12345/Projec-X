import User from "../Model/userModal";

import { Request, Response, NextFunction } from "express";
import UserRepository from "../Repositories/userRepository";
import HTTP_statusCode from "../Enums/httpStatusCode";
import Company from "../Model/companyModal";

const userRepository = new UserRepository(User, Company);

async function isBloked(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      res
        .status(HTTP_statusCode.unAuthorized)
        .json({ message: "Access denied. User ID not found." });
      return;
    }
    const isBlocked = await userRepository.userIsBlocked(user_id);
    console.log("user is blocked => ", isBlocked);
    if (isBlocked === true) {
      res
        .status(HTTP_statusCode.unAuthorized)
        .json({ message: "Access denied. User is blocked." });
      return;
    }
    next();
  } catch (error) {
    res
      .status(HTTP_statusCode.InternalServerError)
      .json({ message: "Server error." });
    return;
  }
}

export default isBloked;
