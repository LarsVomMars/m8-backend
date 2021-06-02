import type { Request, Response, NextFunction, Application } from "express";

import jsdoc from "swagger-jsdoc";
import ui from "swagger-ui-express";
import { ApiKeysModel } from "./db";
import type { ApiPermissions } from "./db";

export function authMiddleware(permission: ApiPermissions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            const [headerKey, headerValue] = req.headers.authorization.split(" ");
            if (headerKey !== "Bearer")
                return res.status(400).json({ success: false, message: "Bad Request" });
            const key = await ApiKeysModel.findOne({key: headerValue}).exec();
            if (!key || key.permission < permission)
                return res.status(401).json({ success: false, message: "Unauthorized" });
            req.apiKey = key;
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
