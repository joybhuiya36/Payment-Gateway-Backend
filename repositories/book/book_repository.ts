import { IBook } from "../../interfaces/book/book_interface";
import BookModel from "../../model/book/bookModel";

export default class BookRepository {
  static async findAllBook(): Promise<IBook[]> {
    return await BookModel.find({});
  }
}
