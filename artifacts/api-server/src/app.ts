import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

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
app.use(cors());
// Blog admin me base64 image (data URL) body jaata hai, jo default 100kb
// express limit se bada hota hai — isliye sirf blog routes ke liye limit badhaayi
// hai, baaki endpoints par default chhota limit rahega.
app.use("/api/blog", express.json({ limit: "8mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check — hamesha 200 return karta hai, taaki cron/uptime services
// (jaise cron-job.org, UptimeRobot) base URL pe bhi successive response paayein.
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);

export default app;
