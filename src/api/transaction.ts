import { Router } from "express";
import { UserModel, ProductModel } from "../db";
import { authMiddleware } from "../util";
import { ApiPermissions } from "../db";

const transaction = Router();

transaction.post("/buy", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    // TODO: Create users/deposit first
    const { pid, userQR, userPin, adminQR, adminPin, amount = 1 } = req.body;
    if (!pid || !userQR || !userPin || !adminQR || !adminPin || !amount)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const product = await ProductModel.findById(pid).exec();
        const user = await UserModel.findOne({ qr: userQR, pin: userPin }).exec();
        const admin = await UserModel.findOne({ qr: adminQR, pin: adminPin }).exec();

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

transaction.put("/deposit", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    // TODO: Create users first
    const { userQR, userPin, adminQR, adminPin, balance } = req.body;
    if (!userQR || !userPin || !adminQR || !adminPin || !balance || balance < 0)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const user = await UserModel.findOne({ qr: userQR, pin: userPin }).exec();
        const admin = await UserModel.findOne({ qr: adminQR, pin: adminPin }).exec();

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

transaction.put("/clear", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    const { userQR, userPin, adminQR, adminPin } = req.body;
    if (!userQR || !userPin || !adminQR || !adminPin)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const user = await UserModel.findOne({ qr: userQR, pin: userPin }).exec();
        const admin = await UserModel.findOne({ qr: adminQR, pin: adminPin }).exec();

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
