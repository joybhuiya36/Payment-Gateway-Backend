import { IResponse } from "../../interfaces/http/response_interface";
import BookRepository from "../../repositories/book/book_repository";
import { HTTP_STATUS } from "../../constants/statusCodes";

export default class BookService {
  static async findAllBook(): Promise<IResponse> {
    const books = await BookRepository.findAllBook();
    if (!books) {
      return {
        success: false,
        message: "Data isn't Found",
        error: {
          message: "Data isn't Found",
          status: HTTP_STATUS.NOT_FOUND,
        },
      };
    }
    return {
      success: true,
      message: "All Books are Fetched Successfully",
      data: books,
    };
  }
}
