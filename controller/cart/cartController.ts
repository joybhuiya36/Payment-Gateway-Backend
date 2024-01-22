import { Request, Response } from "express";
import { failure, success } from "../../utils/common";
import { HTTP_STATUS } from "../../constants/statusCodes";
import CartService from "../../services/cart/cart_service";
import mongoose from "mongoose";

export default class CartController {
  static async viewCart(req: Request, res: Response) {
    try {
      const { userId } = req.params;
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
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal Server Error"));
    }
  }
}
