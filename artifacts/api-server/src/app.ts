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
    allowedHeaders: ["Content-Type", "x-csrf-token", ...(process.env.ALLOW_LEGACY_ADMIN_KEY === "true" ? ["x-admin-key"] : [])],
    exposedHeaders: ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 86_400,
    optionsSuccessStatus: 204,
  }),
);

app.use(cookieParser());

// Blog admin me base64 image (data URL) body jaata hai — isko global `app.use`
// me 8mb set karna zaroor nahi tha, kyunki wahi global parser public read routes
// ke liye tight (128kb) hoti. Ab isko sirf admin write routes me, unke baad
// `requireAdmin` ke baad, per-route lagta hai (see routes/blog.ts + routes/content.ts).
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
