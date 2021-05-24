import type { Request, Response, NextFunction, Application } from "express";
import connect from "./db";

import jsdoc from "swagger-jsdoc";
import ui from "swagger-ui-express";

export async function getKeys(): Promise<string[]> {
    const client = await connect();
    if (!client) return [];
    const db = client.db("mate");
    if (!db) return [];
    const tbl = db.collection("api_keys");
    const keys = (await tbl.find().toArray()).map((d) => d.key);
    client.close();
    return keys;
}

export function authMiddleware(keys: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            const [headerKey, headerValue] = req.headers.authorization.split(" ");
            if (headerKey !== "Bearer")
                return res.status(400).json({ success: false, message: "Bad Request" });
            if (!keys.includes(headerValue))
                return res.status(401).json({ success: false, message: "Unauthorized" });
            return next();
        }
        return res.status(400).json({ success: false, message: "Bad Request" });
    };
}

export function initSwaggerDoc(app: Application) {
    const options: jsdoc.Options = {
        definition: {
            schemes: ["http", "https"],
            basePath: "/api/",
            consumes: ["application/json"],
            produces: ["application/json"],
            swagger: "2.0",
            info: {
                title: "M8",
                version: "1.0.0",
                description: "mate",
                license: {
                    name: "MIT",
                },
            },
            servers: [{ url: "http://localhost:5550/" }],
        },
        apis: ["./src/**/*.ts"],
    };

    /**
     * @swagger
     * securityDefinitions:
     *   APIKeyHeader:
     *     type: apiKey
     *     in: header
     *     name: Authorization
     */

    const spec = jsdoc(options);
    app.get("/", (req, res) => res.redirect("/doc"));
    app.use("/doc", ui.serve, ui.setup(spec, { explorer: true }));
}
