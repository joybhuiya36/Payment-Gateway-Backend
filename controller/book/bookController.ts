import BookService from "../../services/book/book_service";
import { Request, Response } from "express";
import { failure, success } from "../../utils/common";
import { HTTP_STATUS } from "../../constants/statusCodes";

export default class BookController {
  static async getAllBook(req: Request, res: Response) {
    try {
      const books = await BookService.findAllBook();
      if (books?.success) {
        return res.status(200).send(success(books?.message, books?.data));
      }
      return res
        .status(books?.error?.status)
        .send(failure(books?.message, books?.error));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal Server Error"));
    }
  }
}
