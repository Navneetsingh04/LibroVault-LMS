import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import expressFileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import bookRouter from "./routes/bookRouter.js";
import borrowRouter from "./routes/borrowRouter.js";
import userRouter from "./routes/userRouter.js";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Load environment variables
config({ path: "./config/config.env" }); 

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://librovault.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Basic middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const tempDir = path.join(__dirname, "uploads/tmp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: tempDir,
  })
);

// Connect to database and start services
connectDB();
notifyUsers();
removeUnverifiedAccounts();

// API routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/user", userRouter);

// Error handling middleware (must be last)
app.use(errorMiddleware);
