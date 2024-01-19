import BookModel from "../../model/book/bookModel";

export default class BookRepository {
  static async findAllBook() {
    return await BookModel.find({});
  }
}
