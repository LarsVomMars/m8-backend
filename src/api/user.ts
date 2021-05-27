import { Router } from "express";
import { MongoClient } from "mongodb";
import connect from "../db";
import { userTable } from "../util";

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
    console.log(Object.values(Permissions));
    const { qr, pin, balance, permission, admin_qr, admin_pin } = req.body;
    if (
        !qr ||
        !pin ||
        balance === undefined ||
        balance < 0 ||
        permission === undefined ||
        !Object.values(Permissions).includes(permission) ||
        !admin_qr ||
        !admin_pin
    )
        return res.status(400).json({ success: false, error: "Bad request" });
    let client;
    try {
        client = await connect();
        const tbl = userTable(client);
        const admin: IUser = await tbl.findOne({ qr: admin_qr, pin: admin_pin });
        if (!admin || admin.permission === 0)
            return res.status(401).json({ success: false, error: "Unauthorized" });
        await tbl.insertOne({ qr, pin, balance, permission });
        return res.json({ success: true });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    } finally {
        client?.close();
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
    let client;
    try {
        client = await connect();
        const tbl = userTable(client);
        const resp: IUser = await tbl.findOne({ qr });
        if (!resp) return res.status(400).json({ success: false });
        return res.json({ success: true, balance: resp.balance });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, error: "Welp!" });
    } finally {
        client?.close();
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
