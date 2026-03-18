import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer
import chat from "./chat.js";
import { getRecommendations } from "./recommender.js";

dotenv.config();

const app = express(); // Create an express app
app.use(cors());

// Configure multer
// multer is a middleware that is used to handle file uploads, store the file in a temporary location (uploads), and provide the file path to the main function
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const PORT = 5001;

let filePath;

app.post("/upload", upload.single("file"), async (req, res) => {
  // Use multer to handle file upload
  filePath = req.file.path; // The path where the file is temporarily saved
  
  try {
    const recommendations = await getRecommendations(filePath);
    res.json({
      message: filePath + " upload successfully.",
      recommendations: recommendations
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.json({
      message: filePath + " upload successfully.",
      recommendations: []
    });
  }
});

app.get("/chat", async (req, res) => {
  const resp = await chat(filePath, req.query.question); // Pass the file path to your main function
  res.send(resp.text);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
