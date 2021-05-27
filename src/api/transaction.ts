import { Router } from "express";
import { ObjectId } from "mongodb";
import connect from "../db";
import type { IProduct } from "./products";
import type { IUser } from "./user";
import { userTable, productsTable, getUserByQR } from "../util";

const transaction = Router();

transaction.post("/buy", async (req, res) => {
    // TODO: Create users first
    const { pid, user_qr, user_pin, admin_qr, admin_pin, amount } = req.body;
    if (!pid || !user_qr || !user_pin || !admin_qr || !admin_pin || !amount)
        return res.status(400).json({ success: false, error: "Bad request" });

    let client;
    try {
        client = await connect();
        const ptbl = productsTable(client);
        const utbl = userTable(client);

        const product: IProduct = await ptbl.findOne({ _id: new ObjectId(pid) });
        const user = await getUserByQR(utbl, user_qr, user_pin); // TODO: 401 action
        const admin = await getUserByQR(utbl, admin_qr, admin_pin);

        if (!product || !user || !admin)
            return res.status(400).json({ success: false, error: "Bad request" });

        if (product.permission > admin.permission)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        const price = product.price * amount;

        if (user.balance < price || product.amount * product.bottles_per_crate < amount)
            return res.status(402).json({ success: false, error: "Payment required" });

        const balance = user.balance - price;

        utbl.replaceOne({ _id: new ObjectId(user._id) }, { balance });
        return res.json({ success: true, balance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    } finally {
        client?.close();
    }
});

transaction.put("/deposit", async (req, res) => {
    const { user_qr, user_pin, admin_qr, admin_pin, balance } = req.body;
    if (!user_qr || !user_pin || !admin_qr || !admin_pin || !balance || balance < 0)
        return res.status(400).json({ success: false, error: "Bad request" });

    let client;
    try {
        client = await connect();
        const tbl = userTable(client);
        const user = await getUserByQR(tbl, user_qr, user_pin);
        const admin = await getUserByQR(tbl, admin_qr, admin_pin);

        if (!user || !admin)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        const nb = user.balance + balance;
        tbl.replaceOne({ _id: new ObjectId(user._id) }, { balance: nb });
        return res.json({ success: true, balance: nb });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    } finally {
        client?.close();
    }
});

transaction.put("/clear", async (req, res) => {
    const { user_qr, user_pin, admin_qr, admin_pin } = req.body;
    if (!user_qr || !user_pin || !admin_qr || !admin_pin)
        return res.status(400).json({ success: false, error: "Bad request" });

    let client;
    try {
        client = await connect();
        const tbl = userTable(client);
        const user = await getUserByQR(tbl, user_qr, user_pin);
        const admin = await getUserByQR(tbl, admin_qr, admin_pin);

        if (!user || !admin)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        tbl.replaceOne({ _id: new ObjectId(user._id) }, { balance: 0 });
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    } finally {
        client?.close();
    }
});

export default transaction;
