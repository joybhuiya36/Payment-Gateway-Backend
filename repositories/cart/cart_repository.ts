import mongoose from "mongoose";
import CartModel from "../../model/cart/cartModel";
import { ICartPopulate } from "../../interfaces/cart/cart_interface";

export default class CartRepository {
  static async findCartbyUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<ICartPopulate | null> {
    return await CartModel.findOne({ user: userId }).populate("books.book");
  }
}
