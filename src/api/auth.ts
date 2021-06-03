import { Router } from "express";
import { ApiPermissions } from "../db";
import { authMiddleware } from "../util";

const auth = Router();

auth.get("/", authMiddleware(ApiPermissions.READ), (req, res) => {
    res.json({ success: true, permission: req.apiKey.permission });
});

export default auth;
