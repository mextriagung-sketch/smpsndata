import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // MASUKKAN URL WEB APP DARI GOOGLE APPS SCRIPT DI SINI
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwcpTyuGU1pQTfAfIRKE103gu79vjJNgEOVdSsjvChZPVtQuQeU38vzcVZcgO6Xr-Fi/exec';

  // API Routes
  
  // Search students
  app.get("/api/students", async (req, res) => {
    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('MASUKKAN_URL')) {
        return res.status(400).json({ error: "URL Apps Script belum diisi" });
      }

      const query = req.query.q || "";
      const response = await fetch(`${APPS_SCRIPT_URL}?q=${encodeURIComponent(query as string)}`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Submit data
  app.post("/api/submit", async (req, res) => {
    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('MASUKKAN_URL')) {
        return res.status(400).json({ error: "URL Apps Script belum diisi" });
      }

      console.log("Submitting to Apps Script:", req.body);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: { 'Content-Type': 'application/json' },
        redirect: 'follow'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Apps Script Error Response:", errorText);
        throw new Error(`Apps Script returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error submitting data:", error);
      res.status(500).json({ error: error.message || "Terjadi kesalahan saat mengirim data ke Google Sheets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
