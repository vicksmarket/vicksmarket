import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

const allowedOrigins = [
  process.env.STORE_ORIGIN,          // e.g. https://store.vicksmarket.com
  process.env.ADMIN_ORIGIN,          // e.g. https://admin.vicksmarket.com
  "http://localhost:3000",
  "http://localhost:19437",
  // Allow all *.replit.dev subdomains for dev preview
  /https?:\/\/.*\.replit\.dev$/,
  /https?:\/\/.*\.spock\.replit\.dev$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return cb(null, true);
      const allowed = allowedOrigins.some(o =>
        typeof o === "string" ? o === origin : (o as RegExp).test(origin)
      );
      cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;
