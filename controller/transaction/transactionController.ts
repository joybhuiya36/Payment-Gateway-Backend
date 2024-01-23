import express, { Request, Response } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cartModel from "../../model/cart/cartModel";
import userModel from "../../model/user/userModel";
import bookModel from "../../model/book/bookModel";
import transactionModel from "../../model/transaction/transactionModel";
const jsonwebtoken = require("jsonwebtoken");
const SSLCommerzPayment = require("sslcommerz-lts");
import { uuid } from "uuidv4";
import { HTTP_STATUS } from "../../constants/statusCodes";
import { failure, success } from "../../utils/common";
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;

export default class TransactionController {
  static async allTransaction(req: Request, res: Response) {
    try {
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
      // console.log(user);
      let trans = await transactionModel
        .find({ user: user._id })
        .populate("user", "-__v -_id")
        .populate("books.book");
      trans = trans.reverse();
      if (trans.length > 0) {
        return res
          .status(200)
          .send(success("All Transactions are Fetched!", trans));
      }
      return res.status(200).send(success("No Transaction is Found!"));
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
  static async sslInit(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      console.log(userId);

      const user = await userModel.findOne({ _id: userId });
      const transactionId = uuid();
      if (!user)
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User isn't Found"));
      const userCart = await cartModel.findOne({ user: user._id });
      if (!userCart) {
        return res
          .status(404)
          .send(failure("Cart is not found for this user!"));
      }
      let totalCost = 0;
      for (const cartItem of userCart.books) {
        const bookData = await bookModel.findOne({
          _id: cartItem.book,
        });
        if (bookData) {
          if (bookData.stock < cartItem.quantity) {
            return res.status(401).send(failure("Book is Out of Stock!"));
          }
          totalCost += bookData.price * cartItem.quantity;
        }
      }
      const transaction = await transactionModel.create({
        transId: transactionId,
        user: user._id,
        books: userCart.books,
        total: totalCost,
      });

      const data = {
        total_amount: totalCost,
        currency: "BDT",
        tran_id: transactionId,
        success_url: "http://localhost:8000/transaction/paymentSuccess",
        fail_url: "http://localhost:8000/transaction/paymentFail",
        cancel_url: "http://localhost:8000/transaction/cancel",
        ipn_url: "http://localhost:8000/transaction/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: user.name,
        cus_email: user.email,
        cus_add1: user.address,
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: user.phone,
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse: any) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        console.log("Redirecting to: ", GatewayPageURL);
        return res.status(HTTP_STATUS.OK).send({ GatewayPageURL });
      });
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send("Internal Server Error");
    }
  }
  static async paymentSuccess(req: Request, res: Response) {
    try {
      const { tran_id } = req.body;
      const transaction = await transactionModel.findOne({ transId: tran_id });
      const userId = transaction.user;

      const userCart = await cartModel.findOne({ user: userId });
      if (!userCart) {
        return res
          .status(404)
          .send(failure("Cart is not found for this user!"));
      }
      for (const cartItem of userCart.books) {
        const bookData = await bookModel.findOne({
          _id: cartItem.book,
        });
        if (bookData) {
          bookData.stock -= cartItem.quantity;
          await bookData.save();
        }
      }

      const deletionResult = await cartModel.deleteOne({ user: userId });
      if (deletionResult.deletedCount) {
        console.log("Payment Successful");
        return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
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
  static async paymentFailed(req: Request, res: Response) {
    const { tran_id } = req.body;
    await transactionModel.deleteOne({ transId: tran_id });
    console.log("Payment Failed");
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
}
