import { Router } from "express";
import { ApiKeysModel, ApiPermissions } from "../db";
import { addApiKey, authMiddleware } from "../util";

const auth = Router();

auth.get("/", async (req, res) => {
    if ((await ApiKeysModel.count()) !== 0)
        return res.status(410).json({ success: false, error: "Gone" });

    try {
        const key = await addApiKey("AdminKey", ApiPermissions.ADMIN);
        res.json({ success: true, ...key });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: "Welp!" });
    }
});

auth.post("/", authMiddleware(ApiPermissions.ADMIN), async (req, res) => {
    const { name, permission } = req.body;
    if (!name || !permission)
        return res.status(400).json({ success: false, error: "Bad request" });

    try {
        const key = await addApiKey(name, permission);
        res.json({ success: true, ...key });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: "Welp!" });
    }
});

auth.delete("/", authMiddleware(ApiPermissions.ADMIN), async (req, res) => {
    const { key, name } = req.body;
    if (!key || !name) return res.status(400).json({ success: false, error: "Bad request" });

    try {
        await ApiKeysModel.deleteOne({ key, name });
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: "Welp!" });
    }
});

export default auth;
