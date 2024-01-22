import { HTTP_STATUS } from "../../constants/statusCodes";
import { failure, success } from "../../utils/common";
import authModel from "../../model/auth/authModel";
import userModel from "../../model/user/userModel";
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
import { Request, Response } from "express";
import { IAuth } from "../../interfaces/auth/auth_interface";

class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, phone, address, role } = req.body;
      const finder = await userModel.findOne({ email: email });
      if (finder) {
        return res.status(HTTP_STATUS.OK).send(failure("User Already Exists"));
      }
      const userData = await userModel.create({ name, email, phone, address });
      const hashedPassword = await bcrypt
        .hash(password, 10)
        .then((hash: string) => {
          return hash;
        });
      const authData = await authModel.create({
        email: email,
        password: hashedPassword,
        user: userData._id,
        verified: false,
        role: role,
      });
      if (!authData)
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Failed to Create User"));
      return res
        .status(HTTP_STATUS.OK)
        .send(success("New User Created Successfully", userData));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal Server Error"));
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const auth = await authModel
        .findOne({ email: email })
        .populate("user", "-__v");
      if (!auth) {
        return res.status(HTTP_STATUS.OK).send(failure("User isn't Found!"));
      }
      const rslt = await bcrypt.compare(password, auth.password);
      if (!rslt) {
        return res.status(HTTP_STATUS.OK).send(failure("Invalid Credentials"));
      }
      const responseData: IAuth = auth.toObject();
      delete responseData._id;
      delete responseData.password;
      delete responseData.__v;
      const jwt = jsonwebtoken.sign(responseData, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      responseData.token = jwt;
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Successfully Logged In", responseData));
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal Server Error"));
    }
  }
}

export default AuthController;
