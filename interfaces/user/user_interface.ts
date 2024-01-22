import mongoose from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
}
