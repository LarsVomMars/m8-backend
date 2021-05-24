import { Router } from "express";
import type { Collection, MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import connect from "../db";
import type { IProduct } from "./products";
import type { IUser } from "./user";

const transaction = Router();

const productTable = (client: MongoClient): Collection =>
    client.db("mate").collection("products");
const userTable = (client: MongoClient): Collection => client.db("mate").collection("users");

transaction.post("/buy", async (req, res) => {
    const { pid, uid, amt } = req.body;
    if (!pid || !uid) return res.status(400).json({ success: false, error: "Bad request" });
    const client = await connect();
    const ptbl = productTable(client);
    const utbl = userTable(client);
    const product: IProduct = await ptbl.findOne({ _id: new ObjectId(pid) });
    const user: IUser = await utbl.findOne({ _id: new ObjectId(uid) });

    const price = product.price * amt;

    if (user.balance < price)
        return res.status(402).json({ success: false, error: "Payment required" });

    utbl.replaceOne({ _id: new ObjectId(uid) }, { balance: user.balance - price });
    client.close();
    res.json({ success: true, balance: user.balance - price });
});

transaction.put("/load", async (req, res) => {
    const { uid, balance } = req.body;
    if (!uid || !balance)
        return res.status(400).json({ success: false, error: "Bad request" });
    const client = await connect();
    const tbl = userTable(client);
    const user: IUser = await tbl.findOne({ _id: new ObjectId(uid) });
    const nb = user.balance + balance;
    tbl.replaceOne({ _id: new ObjectId(uid) }, { balance: nb });
    client.close();
    res.json({ success: true, balance: nb });
});

transaction.put("/clear", async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ success: false, error: "Bad request" });
    const client = await connect();
    const tbl = userTable(client);
    const user: IUser = await tbl.findOne({ _id: new ObjectId(uid) });
    
});

export default transaction;
