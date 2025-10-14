import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ dest: "python_backend/background-removal" });


// Your local Python server URL
const PYTHON_API = process.env.PYTHON_API || "http://localhost:7000/remove-background";
const PORT = process.env.PORT || 5000;

console.log("🧩 Using Python API:", PYTHON_API);
console.log("🔧 Running in environment:", process.env.NODE_ENV);

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file recieved in request");
      return res.status(400).send("No image file provided");
    }
    console.log("File recieved: ", req.file.path);

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
    console.log("✅ Image received from Python backend");

    res.set("Content-Type", "image/png");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Processing failed");
  } finally {
    fs.unlinkSync(req.file.path);
    console.log("🧹 Temp file deleted");
  }
});

// Make sure it only runs when running locally
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log("✅ Node API running on http://localhost:${PORT}"));
}

// Export for vercel
export default app;
