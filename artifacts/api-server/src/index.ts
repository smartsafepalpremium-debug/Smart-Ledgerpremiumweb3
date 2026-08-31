import app from "./app";
import { logger } from "./lib/logger";
import { accrueAllActiveInvestments } from "./lib/investment-accrual";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  const runAccrualSweep = () => {
    void accrueAllActiveInvestments()
      .then((userCount) => logger.debug({ userCount }, "Investment accrual sweep completed"))
      .catch((sweepError) => logger.error({ err: sweepError }, "Investment accrual sweep failed"));
  };
  runAccrualSweep();
  const accrualTimer = setInterval(runAccrualSweep, 60 * 60 * 1000);
  accrualTimer.unref();
});
