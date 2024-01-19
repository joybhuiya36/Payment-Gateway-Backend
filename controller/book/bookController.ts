import BookService from "../../services/book/book_service";
import { Request, Response } from "express";
import { failure, success } from "../../utils/common";

export default class BookController {
  static async getAllBook(req: Request, res: Response) {
    const books = await BookService.findAllBook();
    if (books.success) {
      return res
        .status(200)
        .send(success("All Books are Fetched Successfully", books.data));
    }
    return res.status(404).send(failure("Not Data Found"));
  }
}
