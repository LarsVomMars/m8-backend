import { Router } from "express";
import { ApiPermissions, ProductModel } from "../db";
import { authMiddleware } from "../util";
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
products.get("/", authMiddleware(ApiPermissions.READ), async (_req, res) => {
    const products = await ProductModel.find().exec();
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
products.post("/", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    const { name, price, amount, bottles_per_crate, permission } = req.body;
    if (
        !name ||
        price === null ||
        amount === null ||
        bottles_per_crate === null ||
        permission === null ||
        !Object.values(Permissions).includes(permission)
    )
        return res.status(400).json({ succes: false, error: "Bad Request" });

    try {
        const product = new ProductModel({
            name,
            price,
            amount,
            bottles_per_crate,
            permission,
        });
        await product.save();

        const products = await ProductModel.find().exec();
        res.json({ success: true, products });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
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
products.put("/", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    const { _id, name, price, amount, bottles_per_crate, permission } = req.body;
    if (
        !_id ||
        !name ||
        price === null ||
        amount === null ||
        bottles_per_crate === null ||
        permission === null ||
        !Object.values(Permissions).includes(permission)
    )
        return res.status(400).json({ succes: false, error: "Bad Request" });
    try {
        await ProductModel.findByIdAndUpdate(_id, {
            name,
            price,
            amount,
            bottles_per_crate,
            permission,
        });
        const products = await ProductModel.find().exec();
        res.json({ success: true, products });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
});

/**
 * @swagger
 * /products/{id}:
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
 *       - in: path
 *         name: product id
 *         type: string
 *         description: Product id
 *     responses:
 *       "200":
 *         description: Success
 */
products.delete("/:id", authMiddleware(ApiPermissions.WRITE), async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: "Bad Request" });
    try {
        await ProductModel.findByIdAndDelete(id);
        const products = await ProductModel.find().exec();
        res.json({ success: true, products });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false });
    }
});

export default products;

export interface IProduct {
    _id: string;
    name: string;
    price: number;
    amount: number;
    bottles_per_crate: number;
    permission: Permissions;
}
