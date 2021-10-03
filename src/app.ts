import { config as dotenvConfig } from "dotenv";
import { init as initDB } from "./db";
import * as util from "./util";
dotenvConfig();

import express from "express";
import api from "./api";
import auth from "./api/auth";

import cors from "cors";

const PORT = process.env.PORT || 5550;
const app = express();

async function main() {
    await initDB();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(cors());

    util.initSwaggerDoc(app);
    app.use("/api", api);
    app.use("/auth", auth);

    app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
}

main().catch(console.error);
