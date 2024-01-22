import mongoose from "mongoose";
import CartRepository from "../../repositories/cart/cart_repository";
import { HTTP_STATUS } from "../../constants/statusCodes";
import { IResponse } from "../../interfaces/http/response_interface";

export default class CartService {
  static async viewCart(userId: mongoose.Types.ObjectId): Promise<IResponse> {
    const cart = await CartRepository.findCartbyUserId(userId);
    if (!cart) {
      return {
        success: false,
        message: "Cart isn't Found",
        error: {
          message: "Cart isn't Found",
          status: HTTP_STATUS.NOT_FOUND,
        },
      };
    }
    return {
      success: true,
      message: "Cart Data is Fetched Successfully",
      data: cart,
    };
  }
}
