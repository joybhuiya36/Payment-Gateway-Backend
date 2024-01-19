import express from "express";
import BookController from "../../controller/book/bookController";
const route = express();

route.get("/all", BookController.getAllBook);

export default route;
