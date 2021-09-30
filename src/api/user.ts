import { Router } from "express";
import { UserModel } from "../db";

const user = Router();

/**
 * @swagger
 * /user/:
 *   post:
 *     description: Add a new user
 *     tags:
 *     - "user"
 *     produces:
 *     - "application/json"
 *     consumes:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     parameters:
 *       - in: body
 *         name: user
 *         description: To be created user
 *         schema:
 *           type: object
 *           properties:
 *             qr:
 *               type: string
 *             pin:
 *               type: string
 *             balance:
 *               type: number
 *               format: float
 *             permission:
 *               type: integer
 *             admin_qr:
 *               type: string
 *             admin_pin:
 *               type: string
 *     responses:
 *       "200":
 *         description: Success
 *       "400":
 *         description: Wrong parameters
 *       "401":
 *         description: Wrong authentication
 */
user.post("/", async (req, res) => {
    const { userQR, userPin, balance, permission, adminQR, adminPin } = req.body;
    if (
        !userQR ||
        !userPin ||
        balance === undefined ||
        permission === undefined ||
        !Object.values(Permissions).includes(permission) ||
        !adminQR ||
        !adminPin ||
        !/\d{4}/.test(userPin)
    )
        return res.status(400).json({ success: false, error: "Bad request" });
    try {
        const admin = await UserModel.findOne({ qr: adminQR, pin: adminPin }).exec();
        if (!admin || admin.permission === 0)
            return res.status(401).json({ success: false, error: "Unauthorized" });

        const user = new UserModel({ qr: userQR, pin: userPin, balance, permission });
        user.save();
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    }
});

/**
 * @swagger
 * /user/{qr}:
 *   get:
 *     description: Get a users balance
 *     tags:
 *     - "user"
 *     produces:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     parameters:
 *       - in: path
 *         name: qr
 *         type: string
 *         required: true
 *         description: QR Code
 *     responses:
 *       "200":
 *         description: Ok
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             balance:
 *               type: number
 *               format: float
 */
user.get("/:qr", async (req, res) => {
    const { qr } = req.params;
    if (!qr) return res.status(400).json({ success: false, error: "Bad request" });
    try {
        const user = await UserModel.findOne({ qr }).exec();
        console.log(user);
        if (!user) return res.status(400).json({ success: false, error: "Bad request" });
        return res.json({ success: true, balance: user.balance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    }
});

export default user;

export interface IUser {
    _id: string;
    qr: string;
    pin: string;
    balance: number;
    permission: Permissions;
}

export enum Permissions {
    TN,
    M,
    ID,
    SDA,
}
