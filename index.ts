import express from "express";
import apiApp from "./artifacts/api-server/src/app";

const app = express();
app.use(apiApp);

export default app;