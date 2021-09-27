import { Router } from "express";
import { ObjectId } from "mongodb";
import { UserModel, ProductModel } from "../db";

const transaction = Router();

export function createUser(qr: string, pin: string, balance: number) {

}

transaction.post("/buy", async (req, res) => {
    // TODO: Create users/deposit first
    const { pid, user_qr, user_pin, admin_qr, admin_pin, amount } = req.body;
    if (!pid || !user_qr || !user_pin || !admin_qr || !admin_pin || !amount)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const product = await ProductModel.findById(pid).exec();
        const user = await UserModel.findOne({ qr: user_qr, pin: user_pin }).exec();
        const admin = await UserModel.findOne({ qr: admin_qr, pin: admin_pin }).exec();

        if (!product || !user || !admin)
            return res.status(400).json({ success: false, error: "Bad request" });

        if (product.permission > admin.permission)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        const price = product.price * amount;

        if (user.balance < price || product.amount * product.bottles_per_crate < amount)
            return res.status(402).json({ success: false, error: "Payment required" });

        const balance = user.balance - price;

        await UserModel.findByIdAndUpdate(user._id, { balance }).exec();
        return res.json({ success: true, balance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    }
});

transaction.put("/deposit", async (req, res) => {
    // TODO: Create users first
    const { user_qr, user_pin, admin_qr, admin_pin, balance } = req.body;
    if (!user_qr || !user_pin || !admin_qr || !admin_pin || !balance || balance < 0)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const user = await UserModel.findOne({ qr: user_qr, pin: user_pin }).exec();
        const admin = await UserModel.findOne({ qr: admin_qr, pin: admin_pin }).exec();

        if (!user || !admin)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        const nb = user.balance + balance;
        await UserModel.findByIdAndUpdate(user._id, { balance: nb }).exec();
        return res.json({ success: true, balance: nb });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    }
});

transaction.put("/clear", async (req, res) => {
    const { user_qr, user_pin, admin_qr, admin_pin } = req.body;
    if (!user_qr || !user_pin || !admin_qr || !admin_pin)
        return res.status(400).json({ success: false, error: "Bad request" });

    let client;
    try {
        const user = await UserModel.findOne({ qr: user_qr, pin: user_pin }).exec();
        const admin = await UserModel.findOne({ qr: admin_qr, pin: admin_pin }).exec();

        if (!user || !admin)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        await UserModel.findByIdAndUpdate(user._id, { balance: 0 }).exec();
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    }
});

export default transaction;
