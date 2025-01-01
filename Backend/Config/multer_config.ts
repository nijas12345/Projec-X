import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Define the storage configuration with proper types
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

// Set up the Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    cb(null, true); // You can add custom filtering logic if needed
  },
});

export default upload;
