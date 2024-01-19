import { IResponse } from "../../interfaces/http/response_interface";
import BookRepository from "../../repositories/book/book_repository";

export default class BookService {
  static async findAllBook(): Promise<IResponse> {
    const books = await BookRepository.findAllBook();
    if (!books) {
      return {
        success: false,
        message: "",
        error: {
          message: "Book isn't Found",
          status: 404,
        },
      };
    }
    return {
      success: true,
      message: "",
      data: books,
    };
  }
}
