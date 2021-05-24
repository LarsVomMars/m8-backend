import { config as dotenvConfig } from "dotenv";
import { init as initDB } from "./db";
import * as util from "./util";
dotenvConfig();
initDB().catch(console.error);

import express from "express";
import api from "./api";
import { Server } from "http";

import cors from "cors";

const PORT = process.env.PORT || 5550;
const app = express();
let server: Server;

async function main() {
    const keys = await util.getKeys();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    util.initSwaggerDoc(app);
    // app.use("/api", util.authMiddleware(keys), api);
    app.use("/api", api);

    server = app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
}

main().catch(console.error);
