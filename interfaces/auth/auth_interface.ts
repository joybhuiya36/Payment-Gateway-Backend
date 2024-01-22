import mongoose from "mongoose";

export interface IAuth {
  _id?: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  role: number;
  verified: boolean;
  user: mongoose.Types.ObjectId;
  resetPassword?: boolean | null;
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  token?: string;
  __v?: number;
}
