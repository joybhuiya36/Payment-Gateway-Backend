import mongoose from "mongoose";
import { IBook } from "../book/book_interface";

export interface ICart {
  user: mongoose.Schema.Types.ObjectId;
  books: {
    book: mongoose.Schema.Types.ObjectId;
    quantity: number;
  }[];
  total: number;
}

export interface ICartPopulate {
  user: mongoose.Schema.Types.ObjectId;
  books: {
    book: IBook;
    quantity: number;
  }[];
  total: number;
}
