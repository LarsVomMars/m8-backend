import { Router } from "express";
import { ObjectId } from "mongodb";
import connect from "../db";
import { Permissions } from "./user";

const products = Router();

/**
 * @swagger
 * definitions:
 *   Product:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       amount:
 *         type: number
 *         format: float
 *       bottles_per_crate:
 *         type: integer
 *       price:
 *         type: number
 *         format: float
 *       permission:
 *         type: integer
 *
 *   IProduct:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *         type: string
 *       amount:
 *         type: number
 *         format: float
 *       bottles_per_crate:
 *         type: integer
 *       price:
 *         type: number
 *         format: float
 *       permission:
 *         type: integer
 */

/**
 * @swagger
 * /products/:
 *   get:
 *     description: Get a list of all products
 *     tags:
 *     - "products"
 *     produces:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     responses:
 *       "200":
 *         description: List of all products
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             products:
 *               type: array
 *               items:
 *                 $ref: "#/definitions/IProduct"
 */
products.get("/", async (_req, res) => {
    const client = await connect();
    const db = client.db("mate");
    const tbl = db.collection("products");
    const products = await tbl.find().toArray();
    client.close();
    res.json({ succes: true, products });
});

/**
 * @swagger
 * /products/:
 *   post:
 *     description: Add a new product
 *     tags:
 *     - "products"
 *     produces:
 *     - "application/json"
 *     consumes:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     parameters:
 *       - in: body
 *         name: product
 *         description: To be created product
 *         schema:
 *           $ref: "#/definitions/Product"
 *     responses:
 *       "200":
 *         description: Success
 */
products.post("/", async (req, res) => {
    const { name, price, amount, bottles_per_crate, permission } = req.body;
    if (
        !name ||
        price === null ||
        amount === null ||
        bottles_per_crate === null ||
        permission === null
    )
        return res.status(400).json({ succes: false, error: "Bad Request" });
    const client = await connect();
    const db = client.db("mate");
    const tbl = db.collection("products");
    await tbl.insertOne({ name, price, amount, bottles_per_crate, permission });
    client.close();
    res.json({ success: true });
});

/**
 * @swagger
 * /products/:
 *   put:
 *     description: Update a product
 *     tags:
 *     - "products"
 *     produces:
 *     - "application/json"
 *     consumes:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     parameters:
 *       - in: body
 *         name: product
 *         description: Product data
 *         schema:
 *           $ref: "#/definitions/IProduct"
 *     responses:
 *       "200":
 *         description: Success
 */
products.put("/", async (req, res) => {
    const { id, name, price, amount, bottles_per_crate, permission } = req.body;
    if (
        !name ||
        price === null ||
        amount === null ||
        bottles_per_crate === null ||
        permission === null
    )
        return res.status(400).json({ succes: false, error: "Bad Request" });
    const client = await connect();
    const db = client.db("mate");
    const tbl = db.collection("products");
    await tbl.replaceOne(
        { _id: new ObjectId(id) },
        { name, price, amount, bottles_per_crate, permission }
    );
    client.close();
    res.json({ success: true });
});

/**
 * @swagger
 * /products/:
 *   delete:
 *     description: Delete a new product
 *     tags:
 *     - "products"
 *     produces:
 *     - "application/json"
 *     consumes:
 *     - "application/json"
 *     security:
 *     - APIKeyHeader: []
 *     parameters:
 *       - in: body
 *         name: product
 *         description: Product id
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *     responses:
 *       "200":
 *         description: Success
 */
products.delete("/", async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "Bad Request" });
    const client = await connect();
    const db = client.db("mate");
    const tbl = db.collection("products");
    await tbl.deleteOne({ _id: new ObjectId(id) });
    client.close();
    res.json({ success: true });
});

export default products;

export interface IProduct {
    _id: string;
    name: string;
    price: number;
    amount: number,
    bottles_per_crate: number;
    permission: Permissions;
}