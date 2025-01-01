import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import HTTP_statusCode from "../Enums/httpStatusCode";
import { log } from "node:console";

dotenv.config();

const secret_key = process.env.JWT_SECRET as string;
const accessTokenTime = process.env.ACCESS_TOKEN_EXPIRY_TIME as string;
const refreshTokenTime = process.env.REFRESH_TOKEN_EXPIRY_TIME as string;
const userAccessTokenName = process.env.USER_ACCESS_TOKEN_NAME as string;
const userRefreshTokenName = process.env.USER_REFRESH_TOKEN_NAME as string;
const adminAccessTokenName = process.env.ADMIN_ACCESS_TOKEN_NAME as string;
const adminRefreshTokenName = process.env.ADMIN_REFRESH_TOKEN_NAME as string;
const userRole = process.env.USER_ROLE as string;
const adminRole = process.env.ADMIN_ROLE as string;

const createToken = (user_id: string, role: string): string => {
  return jwt.sign({ user_id, role }, secret_key, {
    expiresIn: accessTokenTime,
  });
};

const createRefreshToken = (user_id: string, role: string): string => {
  return jwt.sign({ user_id, role }, secret_key, {
    expiresIn: refreshTokenTime,
  });
};

const resetPasswordToken = (email: string, role: string): string => {
  return jwt.sign({ email, role }, secret_key, { expiresIn: "5m" });
};

const jwtverifyToken = (
  accessTokenName: string,
  refreshTokenName: string,
  expectedRole: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.cookies);
      console.log(accessTokenName, refreshTokenName, expectedRole);

      const accessToken: string = req.cookies[accessTokenName];
      console.log(accessToken);

      if (accessToken) {
        jwt.verify(accessToken, secret_key, async (err, decoded) => {
          if (err) {
            await handleRefreshToken(
              req,
              res,
              next,
              accessTokenName,
              refreshTokenName,
              expectedRole
            );
          } else {
            const { user_id, role } = decoded as jwt.JwtPayload;

            if (role !== expectedRole) {
              return res
                .status(HTTP_statusCode.unAuthorized)
                .json({ message: "Access denied. Invalid role." });
            }

            // Set appropriate request field based on role
            if (expectedRole === userRole) {
              req.user_id = user_id;
            } else if (expectedRole === adminRole) {
              console.log("Helloooo");

              req.admin_id = user_id;
            }
            console.log("jaskdjflasdjflkj");

            next();
          }
        });
      } else {
        await handleRefreshToken(
          req,
          res,
          next,
          accessTokenName,
          refreshTokenName,
          expectedRole
        );
      }
    } catch (error) {
      console.log("jaskdfjklasdjflad;laksdjflka;sdjf");

      res
        .status(HTTP_statusCode.unAuthorized)
        .json({ message: "Access denied. Access token not valid." });
    }
  };
};

const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  accessTokenName: string,
  refreshTokenName: string,
  expectedRole: string
) => {
  const refreshToken: string = req.cookies[refreshTokenName];
  console.log("refereseh", refreshToken);

  if (refreshToken) {
    jwt.verify(refreshToken, secret_key, (err, decoded) => {
      if (err) {
        return res
          .status(HTTP_statusCode.unAuthorized)
          .json({ message: "Access denied. Refresh token not valid." });
      } else {
        const { user_id, role } = decoded as jwt.JwtPayload;

        if (!user_id || role !== expectedRole) {
          console.log(role);
          console.log(expectedRole);

          return res
            .status(HTTP_statusCode.unAuthorized)
            .json({ message: "Access denied. Token payload invalid." });
        }
        console.log(user_id, role);

        const newAccessToken = createToken(user_id, role);

        res.cookie(accessTokenName, newAccessToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 15 * 60 * 1000,
        });

        // Set appropriate request field based on role
        if (expectedRole === userRole) {
          req.user_id = user_id;
        } else if (expectedRole === adminRole) {
          req.admin_id = user_id;
        }

        next();
      }
    });
  } else {
    return res
      .status(HTTP_statusCode.unAuthorized)
      .json({ message: "Access denied. Refresh token not provided." });
  }
};

export const verifyResetPasswordToken = (
  token: string
): { email: string | null; role: string | null } => {
  try {
    const decoded = jwt.verify(token, secret_key) as jwt.JwtPayload;
    // Return email and role from the decoded token payload
    return {
      email: decoded.email || null,
      role: decoded.role || null, // Assuming `role` is part of the payload
    };
  } catch (err) {
    return { email: null, role: null }; // Return null values if the token is invalid
  }
};
export const verifyToken = jwtverifyToken(
  userAccessTokenName,
  userRefreshTokenName,
  userRole
);
export const adminVerifyToken = jwtverifyToken(
  adminAccessTokenName,
  adminRefreshTokenName,
  adminRole
);
export { createToken, createRefreshToken, resetPasswordToken };
