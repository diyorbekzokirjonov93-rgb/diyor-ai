const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "12mb"
  })
);

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


/* =========================
   NORMAL CHAT
========================= */

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("CHAT REQUEST:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Savol yozilmadi"
      });
    }

    const completion =
      await client.chat.completions.create({
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

    const answer =
      completion.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error(
        "AI javobi bo'sh qaytdi"
      );
    }

    console.log(
      "AI RESPONSE:",
      answer
    );

    res.json({
      answer
    });
  } catch (error) {
    console.error(
      "AI ERROR:",
      error
    );

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


/* =========================
   IMAGE EDIT
========================= */

app.post(
  "/api/image-edit",
  async (req, res) => {
    try {
      const { image, prompt } =
        req.body;

      if (!image) {
        return res.status(400).json({
          error: "Rasm yuborilmadi"
        });
      }

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error:
            "Rasmni qanday o'zgartirish kerakligini yozing"
        });
      }

      console.log(
        "IMAGE EDIT:",
        prompt
      );

      const response = await fetch(
        "https://openrouter.ai/api/v1/images",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            model:
              "google/gemini-3.1-flash-image",

            prompt: prompt.trim(),

            input_references: [
              {
                type: "image_url",

                image_url: {
                  url: image
                }
              }
            ]
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "IMAGE EDIT ERROR:",
          data
        );

        return res.status(
          response.status
        ).json({
          error:
            data?.error?.message ||
            "Rasmni o'zgartirishda xatolik yuz berdi"
        });
      }

      const result =
        data?.data?.[0];

      if (!result?.b64_json) {
        console.error(
          "IMAGE EDIT RESPONSE:",
          data
        );

        return res.status(500).json({
          error:
            "AI yangi rasm qaytarmadi"
        });
      }

      const mediaType =
        result.media_type ||
        "image/png";

      const generatedImage =
        `data:${mediaType};base64,${result.b64_json}`;

      res.json({
        success: true,
        image: generatedImage
      });

    } catch (error) {
      console.error(
        "IMAGE EDIT ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Rasmni o'zgartirishda xatolik yuz berdi"
      });
    }
  }
);


/* =========================
   IMAGE GENERATE
========================= */

app.post(
  "/api/image-generate",
  async (req, res) => {
    try {
      const { prompt } =
        req.body;

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          error:
            "Rasm uchun prompt yozing"
        });
      }

      console.log(
        "IMAGE GENERATE:",
        prompt
      );

      const response = await fetch(
        "https://openrouter.ai/api/v1/images",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            model:
              "google/gemini-3.1-flash-image",

            prompt: prompt.trim()
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "IMAGE GENERATE ERROR:",
          data
        );

        return res.status(
          response.status
        ).json({
          error:
            data?.error?.message ||
            data?.error?.metadata?.raw ||
            "Rasm yaratishda xatolik yuz berdi"
        });
      }

      console.log(
        "IMAGE GENERATE RESPONSE:",
        data
      );

      const result =
        data?.data?.[0];

      if (!result) {
        return res.status(500).json({
          error:
            "AI javob qaytarmadi"
        });
      }

      if (!result.b64_json) {
        return res.status(500).json({
          error:
            "AI yangi rasm qaytarmadi"
        });
      }

      const mediaType =
        result.media_type ||
        "image/png";

      const generatedImage =
        `data:${mediaType};base64,${result.b64_json}`;

      res.json({
        success: true,
        image: generatedImage
      });

    } catch (error) {
      console.error(
        "IMAGE GENERATE ERROR:",
        error
      );

      res.status(500).json({
        error:
          error?.message ||
          "Rasm yaratishda server xatosi yuz berdi"
      });
    }
  }
);


/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 3002;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `DiyorAI server http://localhost:${PORT} da ishlayapti`
    );
  }
);