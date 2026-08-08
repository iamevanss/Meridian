import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { accountsRouter } from "./routes/accounts";
import { transfersRouter } from "./routes/transfers";
import { adminRouter } from "./routes/admin";

const app = express();

app.use(helmet());
app.use(express.json());

const allowedOrigins = [process.env.CORS_ORIGIN_WEB, process.env.CORS_ORIGIN_ADMIN].filter(
  (origin): origin is string => Boolean(origin)
);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

// Generous general limiter, tighter one on auth endpoints to slow credential stuffing.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Health check — this is the endpoint the uptime bot (Railway/Render cron
// or UptimeRobot) pings every few minutes to keep the service warm and to
// alert if the API or database goes down.
app.get("/health", async (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authLimiter, authRouter);
app.use("/accounts", accountsRouter);
app.use("/transfers", transfersRouter);
app.use("/admin", adminRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Meridian API listening on port ${PORT}`);
});
