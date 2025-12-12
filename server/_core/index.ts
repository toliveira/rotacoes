import fs from "fs";
import { config } from "@dotenvx/dotenvx";

const env = process.env.NODE_ENV;
const localPath = ".env";
const envPath = env === "production" ? ".env.production" : ".env.development";

if (fs.existsSync(localPath)) {
  config({ path: localPath });
}
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else if (!fs.existsSync(localPath)) {
  config();
}
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import next from "next";
import path from "path";
import { storagePut } from "../storage";
import { getAuth as getAdminAuth } from "../firebase";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const dev = process.env.NODE_ENV !== "production";
  const nextApp = next({ dev, dir: process.cwd() });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve uploads
  const uploadsPath = path.resolve(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.post("/api/upload", async (req, res) => {
    try {
      const { key, dataBase64, contentType } = req.body || {};
      if (!key || !dataBase64) {
        res.status(400).json({ error: "key and dataBase64 are required" });
        return;
      }
      const buffer = Buffer.from(String(dataBase64), "base64");
      const result = await storagePut(String(key), buffer, String(contentType || "application/octet-stream"));
      res.json({ success: true, ...result });
    } catch (e) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      //how to print req.body
      const { idToken } = req.body || {};
      if (!idToken || typeof idToken !== "string") {
        res.status(400).json({ error: "idToken is required" });
        return;
      }

      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifyIdToken(idToken);
      const uid = decoded.uid;
      const name = decoded.name || decoded.email || "";

      const token = await sdk.createSessionToken(uid, { name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 31536000000 });
      res.json({ success: true });
    } catch (e) {
      res.status(401).json({ error: "Login failed" });
    }
  });

  app.get("/api/env/public", (req, res) => {
    res.json({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || null,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || null,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || null,
      NEXT_PUBLIC_FIREBASE_APPCHECK_KEY: process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY || null,
    });
  });

  // Next.js handler
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
