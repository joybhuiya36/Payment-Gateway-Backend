import AuthController from "../../controller/auth/authController";
import express from "express";
const route = express();

route.post("/sign-up", AuthController.signup);
route.post("/login", AuthController.login);

export default route;
