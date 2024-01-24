import { Request, Response } from "express";
import { failure, success } from "../../utils/common";
import { HTTP_STATUS } from "../../constants/statusCodes";
import CartService from "../../services/cart/cart_service";
import mongoose from "mongoose";
import userModel from "../../model/user/userModel";
import bookModel from "../../model/book/bookModel";
import cartModel from "../../model/cart/cartModel";
const jsonwebtoken = require("jsonwebtoken");

export default class CartController {
  static async viewCart(req: Request, res: Response) {
    try {
      if (!req.headers.authorization)
        return res.status(401).send(failure("Unauthorized Access!"));
      const token = req.headers.authorization.split(" ")[1];
      const check = jsonwebtoken.verify(token, process.env.SECRET_KEY);
      if (!check) throw new Error();
      const userId = check.user._id;
      const cart = await CartService.viewCart(
        new mongoose.Types.ObjectId(userId)
      );
      if (cart?.success) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success(cart?.message, cart?.data));
      }
      return res.status(cart?.error?.status).send(failure(cart?.message));
    } catch (error) {
      if (error instanceof jsonwebtoken.TokenExpiredError) {
        return res.status(401).send(failure("Please Login Again!"));
      }
      if (error instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(401).send(failure("Token Invalid!"));
      }
      return res.status(500).send(failure("Internal Server Error!"));
    }
  }
  static async addToCart(req: Request, res: Response) {
    try {
      const { bookId, quantity } = req.body;
      if (!req.headers.authorization)
        return res.status(401).send(failure("Unauthorized Access!"));
      const token = req.headers.authorization.split(" ")[1];
      const check = jsonwebtoken.verify(token, process.env.SECRET_KEY);
      if (check.role == 1) {
        return res.status(422).send(failure("Admin can't add to cart"));
      }
      if (!check) throw new Error();

      const user = await userModel.findOne({ email: check.email });

      const book = await bookModel.findOne({ _id: bookId });
      if (!book) {
        return res.status(404).send(failure("Book doesn't Exist!"));
      }
      if (!user)
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User isn't Found"));
      const userCart = await cartModel.findOne({ user: user._id });
      const totalCost = book.price * quantity;

      if (userCart) {
        const existingBook = userCart.books.find((x) => x.book == bookId);
        if (existingBook) {
          if (existingBook.quantity + quantity > book.stock) {
            return res.status(401).send(failure("Out of Stock!"));
          }
          existingBook.quantity += quantity;
          userCart.total += totalCost;
          await userCart.save();
        } else {
          if (quantity > book.stock)
            return res.status(401).send(failure("Out of Stock!"));
          userCart.books.push({ book: bookId, quantity: quantity });
          userCart.total += totalCost;
          await userCart.save();
        }
        const populateData = await cartModel
          .findOne({ user: user._id })
          .populate("user", "-_id -__v")
          .populate("books.book", "title price -_id");
        return res
          .status(201)
          .send(
            success(
              "Book Added to the Existing Cart Successfully!",
              populateData
            )
          );
      } else {
        if (quantity > book.stock)
          return res.status(401).send(failure("Out of Stock!"));

        const newData = await cartModel.create({
          user: user._id,
          books: [{ book: bookId, quantity: quantity }],
          total: totalCost,
        });
        const populateData = await cartModel
          .findOne({ user: user._id })
          .populate("user", "-_id -__v")
          .populate("books.book", "title price -_id");
        return res
          .status(201)
          .send(
            success("Book Added Newly to the Cart Successfully!", populateData)
          );
      }
    } catch (error) {
      if (error instanceof jsonwebtoken.TokenExpiredError) {
        return res.status(401).send(failure("Please Login Again!"));
      }
      if (error instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(401).send(failure("Token Invalid!"));
      }
      return res.status(500).send(failure("Internal Server Error!"));
    }
  }
  static async removeItem(req: Request, res: Response) {
    try {
      const { bookId, quantity } = req.body;
      if (!req.headers.authorization)
        return res.status(401).send(failure("Unauthorized Access!"));
      const token = req.headers.authorization.split(" ")[1];
      const check = jsonwebtoken.verify(token, process.env.SECRET_KEY);
      if (!check) throw new Error();

      const user = await userModel.findOne({ email: check.email });
      if (!user)
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User isn't Found"));

      const book = await bookModel.findOne({ _id: bookId });
      if (!book) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Book doesn't Exist!"));
      }
      const userCart = await cartModel.findOne({ user: user._id });
      if (userCart) {
        const bookIndex = userCart.books.findIndex((x) => x.book == bookId);
        if (bookIndex === -1) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("Book is not Found in the Cart!"));
        }
        const book = await bookModel.findOne({
          _id: userCart.books[bookIndex].book,
        });
        if (!book)
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("Book isn't Found"));

        if (userCart.books[bookIndex].quantity < quantity) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .send(failure("Book does not exist in the Cart Enough Times!"));
        } else if (userCart.books[bookIndex].quantity == quantity) {
          if (userCart.books.length === 1) {
            const deletionResult = await cartModel.deleteOne({
              user: user._id,
            });
            if (deletionResult.deletedCount > 0) {
              return res
                .status(HTTP_STATUS.OK)
                .send(success("Book is Successfully Removed!"));
            }
          }
          userCart.books.splice(bookIndex, 1);
        } else if (userCart.books[bookIndex].quantity > quantity) {
          userCart.books[bookIndex].quantity -= quantity;
        }
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("This User Cart doesn't Found!"));
      }
      userCart.total -= book?.price * quantity;
      userCart.save();
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Book is Reduced from the Cart!", userCart));
    } catch (error) {
      if (error instanceof jsonwebtoken.TokenExpiredError) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Please Login Again!"));
      }
      if (error instanceof jsonwebtoken.JsonWebTokenError) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Token Invalid!"));
      }
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal Server Error!"));
    }
  }
}
