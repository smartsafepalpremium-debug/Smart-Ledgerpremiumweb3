import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { accrueAllActiveInvestments } from "./lib/investment-accrual";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = process.env.CORS_ORIGINS
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/api/cron/accrual", async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.get("authorization") !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const userCount = await accrueAllActiveInvestments();
    res.status(200).json({ ok: true, userCount });
  } catch (error) {
    logger.error({ err: error }, "Investment accrual cron failed");
    res.status(500).json({ error: "Investment accrual failed" });
  }
});

app.use("/api", router);

export default app;
