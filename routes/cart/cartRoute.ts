import express from "express";
import CartController from "../../controller/cart/cartController";
const route = express();

route.get("/view", CartController.viewCart);
route.post("/addtocart", CartController.addToCart);
route.post("/remove", CartController.removeItem);

export default route;
