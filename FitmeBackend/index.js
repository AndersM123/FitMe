import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

// Your local Python server URL
const PYTHON_API = process.env.PYTHON_API;
const PORT = process.env.PORT || 5000;

app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);

    // Send to Python FastAPI
    const response = await fetch(PYTHON_API, {
      method: "POST",
      body: fileBuffer,
      headers: { "Content-Type": "application/octet-stream" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Python server error:", text);
      return res.status(500).send("Python backend error");
    }

    const arrayBuffer = await response.arrayBuffer();
    res.set("Content-Type", "image/png");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Processing failed");
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

// Make sure it only runs when running locally
if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("✅ Node API running on http://localhost:5000"));
}

// Export for vercel
export default app;
