import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import databaseConnection from "./config/database";
import cors from "cors";
import { CustomError } from "./interfaces/error/customError_interface";
import bookRoute from "./routes/book/bookRoute";

const app = express();
const PORT = 8000;
dotenv.config();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/book", bookRoute);

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ message: "Invalid JSON Format" });
  } else {
    next(err);
  }
});
app.use((req: Request, res: Response) => {
  return res.status(400).send({ message: "Bad Request" });
});

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT} port`);
  });
});
