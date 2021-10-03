import { Router } from "express";
import products from "./products";
import transaction from "./transaction";
import user from "./user";

const api = Router();

api.use("/products", products);
api.use("/user", user);
api.use("/transaction", transaction);

export default api;
