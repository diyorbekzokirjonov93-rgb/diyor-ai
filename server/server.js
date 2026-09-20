
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("OPENROUTER_API_KEY topilmadi!");
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1"
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "DiyorAI server ishlayapti"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("CHAT REQUEST:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Savol yozilmadi"
      });
    }

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "Sen DiyorAI nomli AI assistantsan. Foydalanuvchiga o'zbek tilida aniq, foydali va tushunarli javob ber."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const answer = completion.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("AI javobi bo'sh qaytdi");
    }

    console.log("AI RESPONSE:", answer);

    res.json({
      answer
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    const errorMessage =
      error?.error?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "AI server xatosi";

    res.status(500).json({
      error: errorMessage
    });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DiyorAI server http://localhost:${PORT} da ishlayapti`);
});

