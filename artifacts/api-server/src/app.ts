import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { apiNotFound, errorHandler, noStore, securityHeaders } from "./lib/http";

const app: Express = express();

// Render/Cloudflare proxy ke peeche asli client IP `req.ip` me mile, warna
// rate limiting sab requests ko proxy ke ek hi IP par ginegi.
app.set("trust proxy", 1);
app.disable("x-powered-by");
// JSON me `<`, `>`, `&` ko escape karo — agar koi response galti se HTML
// context me render ho jaye toh stored/reflected XSS ka risk kam hota hai.
app.set("json escape", true);

app.use(securityHeaders);
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

// CORS sirf approved origins ke liye. Pehle `cors()` sab origins ko allow
// karta tha, jisse koi bhi site admin cookies ke saath requests bhej sakti thi.
const defaultOrigins = [
  "https://bvps-school.vercel.app",
  "https://www.bvps-school.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
];
const allowedOrigins = (process.env.CORS_ORIGINS ?? defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/server-to-server requests me Origin header nahi hota.
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      return callback(null, allowedOrigins.includes(normalized));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key", "x-csrf-token"],
    exposedHeaders: ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 86_400,
    optionsSuccessStatus: 204,
  }),
);

app.use(cookieParser());

// Blog admin me base64 image (data URL) body jaata hai, jo default 100kb
// express limit se bada hota hai — isliye sirf blog routes ke liye limit badhi
// hai. Content editor me `image.*` keys (hero/gallery photo data URLs) save
// hoti hain, unke liye 16mb. Baaki endpoints par chhota limit rehta hai.
app.use("/api/blog", express.json({ limit: "8mb" }));
app.use("/api/content", express.json({ limit: "16mb" }));
app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

// Admin/session responses kabhi cache na hon.
app.use("/api/admin", noStore);
app.use("/api/content/admin", noStore);
app.use("/api/blog/admin", noStore);
app.use("/api/fees/admin", noStore);

// Root health check — hamesha 200 return karta hai, taaki cron/uptime services
// (jaise cron-job.org, UptimeRobot) base URL pe bhi response paayein.
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);

app.use("/api", apiNotFound);
app.use(errorHandler);

export default app;
