import { Schema, model, connect, ObjectId } from "mongoose";
import { Permissions } from "./api/user";

const URI = process.env.MONGO_URL || "mongodb://localhost:27017/mate";

export async function init() {
    await connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

export interface UserCollection {
    qr: string;
    pin: string;
    balance: number;
    permission: Permissions;
}

export interface ProductCollection {
    name: string;
    price: number;
    amount: number;
    bottles_per_crate: number;
    permission: Permissions;
}

export enum ApiPermissions {
    READ,
    WRITE,
    ADMIN,
}

export interface ApiKeysCollection {
    name: string;
    key: string;
    permission: ApiPermissions;
}

export interface TransactionSchema {
    time: { type: Date };
    user: { type: ObjectId; ref: "User" };
    admin: { type: ObjectId; ref: "User" };
    product: { type: ObjectId; ref: "Product" };
}

const userSchema = new Schema<UserCollection>({
    qr: { type: String, required: true },
    pin: { type: String, required: true, match: /\d{4}/ },
    balance: { type: Number, required: true, min: 0 },
    permission: { type: Permissions, required: true },
});

const productSchema = new Schema<ProductCollection>({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    bottles_per_crate: { type: Number, required: true, min: 0 },
    permission: { type: Permissions, required: true },
});

const apiKeysSchema = new Schema<ApiKeysCollection>({
    name: { type: String, required: true },
    key: { type: String, required: true },
    permission: { type: ApiPermissions, required: true },
});

export const UserModel = model<UserCollection>("User", userSchema);
export const ProductModel = model<ProductCollection>("Product", productSchema);
export const ApiKeysModel = model<ApiKeysCollection>("ApiKeys", apiKeysSchema);
