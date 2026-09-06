import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Extract endpoint
  app.post("/api/extract", upload.array("screenshots", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No screenshots provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not set" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts = files.map(file => ({
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype
        }
      }));

      const prompt = `Extract the following information from the provided screenshots of a TikTok profile/subscription and/or a Google Play receipt:
- subscriber_name: The display name of the TikTok user, or name on receipt.
- tiktok_handle: The TikTok @handle (include the @).
- time: The time of the subscription or order (e.g. '6:57pm', '14:30').

Provide the result as a JSON object with keys: subscriber_name, tiktok_handle, time. If a field cannot be found, leave it as an empty string. Return ONLY valid JSON, without any markdown formatting.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [prompt, ...parts],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      let extractedData = {};
      try {
        extractedData = JSON.parse(response.text || '{}');
      } catch (e) {
        console.error("Failed to parse AI response", response.text);
      }

      res.json(extractedData);

    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "Failed to extract data" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to ensure JSON responses instead of Express default HTML
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express global error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
