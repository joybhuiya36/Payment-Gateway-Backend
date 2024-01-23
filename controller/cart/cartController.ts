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
      //   console.log(req.headers.authorization);
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
      const userInCart = await cartModel.findOne({ user: user._id });
      //   console.log(userInCart);
      const totalCost = book.price * quantity;

      if (userInCart) {
        const existingBook = userInCart.books.find((x) => x.book == bookId);
        if (existingBook) {
          if (existingBook.quantity + quantity > book.stock) {
            return res.status(401).send(failure("Out of Stock!"));
          }
          existingBook.quantity += quantity;
          userInCart.total += totalCost;
          await userInCart.save();
        } else {
          if (quantity > book.stock)
            return res.status(401).send(failure("Out of Stock!"));
          userInCart.books.push({ book: bookId, quantity: quantity });
          userInCart.total += totalCost;
          await userInCart.save();
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
        // console.log("else");
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
}
