import type { ApiKeysCollection } from "../../db";

export {};

declare global {
    namespace Express {
        interface Request {
            apiKey: ApiKeysCollection
        }
    }
}