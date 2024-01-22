import mongoose, { Schema } from "mongoose";
import { IBook } from "../../interfaces/book/book_interface";

const bookSchema: Schema<IBook> = new mongoose.Schema<IBook>({
  title: {
    type: String,
    required: [true, "Title was not Provided"],
    maxlength: 30,
  },
  author: {
    type: String,
    required: [true, "Author was not Provided"],
    maxlength: 30,
  },
  price: {
    type: Number,
    required: [true, "Price must be integer and greater than 0"],
    min: 1,
  },
  genre: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  pages: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  stock: {
    type: Number,
    required: [true, "Stock must be inter and greater than or equal to 0"],
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
});

const Book = mongoose.model<IBook>("Book", bookSchema);

export default Book;
