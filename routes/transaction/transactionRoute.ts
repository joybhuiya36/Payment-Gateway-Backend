import express from "express";
const route = express();
import TransactionController from "../../controller/transaction/transactionController";

route.get("/all", TransactionController.allTransaction);
route.post("/ssl-init", TransactionController.sslInit);
route.post("/paymentSuccess", TransactionController.paymentSuccess);
route.post("/paymentFail", TransactionController.paymentFailed);

export default route;
