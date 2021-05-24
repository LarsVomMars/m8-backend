import { Router } from "express";
import connect from "../db";
import { MongoClient, ObjectId } from "mongodb";

const user = Router();

const userTable = (client: MongoClient) => client.db("mate").collection("users");

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
 *     responses:
 *       "200":
 *         description: Success
 */
user.post("/", async (req, res) => {
    const { qr, pin, balance, permission } = req.body;
    if (!qr || !pin || balance === null || permission === null)
        return res.status(400).json({ success: false, error: "Bad request" });

    const client = await connect();
    const tbl = userTable(client);
    await tbl.insertOne({ qr, pin, balance, permission });
    client.close();
    res.json({ success: true });
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
    const client = await connect();
    const tbl = userTable(client);
    const resp = await tbl.find({ qr }).toArray();
    client.close();
    if (resp.length === 0) return res.status(400).json({ success: false });
    res.json({ success: true, balance: resp[0].balance });
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
