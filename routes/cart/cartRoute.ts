import express from "express";
import CartController from "../../controller/cart/cartController";
const route = express();

route.get("/view/:userId", CartController.viewCart);

export default route;
