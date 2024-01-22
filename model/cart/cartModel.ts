import mongoose, { Schema } from "mongoose";
import { ICart } from "../../interfaces/cart/cart_interface";

const cartSchema: Schema<ICart> = new mongoose.Schema<ICart>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  books: {
    type: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        _id: false,
      },
    ],
  },
  total: {
    type: Number,
    required: true,
  },
});

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
