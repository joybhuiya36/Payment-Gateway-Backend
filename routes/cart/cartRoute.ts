import express from "express";
import CartController from "../../controller/cart/cartController";
const route = express();

route.get("/view", CartController.viewCart);
route.post("/addtocart", CartController.addToCart);

export default route;
