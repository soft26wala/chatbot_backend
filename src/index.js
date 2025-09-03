// index.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());

// WhatsApp config
const token = process.env.WHATSAPP_TOKEN; 
const phone_number_id = process.env.PHONE_NUMBER_ID; 
const verify_token = process.env.VERIFY_TOKEN || "my_verify_token";

// OpenAI config
const openai_api_key = process.env.OPENAI_API_KEY; // ChatGPT API key

// ✅ Send WhatsApp Message
async function sendMessage(to, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          text: { body: message },
        }),
      }
    );

    const data = await response.json();
    console.log("✅ Reply sent:", data);
  } catch (err) {
    console.error("❌ Failed to send reply:", err);
  }
}

// ✅ Get GPT Reply
async function getGPTReply(userMessage) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openai_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // ya gpt-4 use kar
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn’t understand.";
  } catch (err) {
    console.error("❌ GPT Error:", err);
    return "Error generating response.";
  }
}


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// ✅ Webhook Verification
app.get("/webhook", (req, res) => {
    console.log("👉 Meta sent:", req.query); // pura query print karega
 
  const VERIFY_TOKEN = "chatbotgpt"; // same jo Meta dashboard me dala

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Incoming Messages
app.post("/webhook", async (req, res) => {
  console.log("📩 Incoming:", JSON.stringify(req.body, null, 2));
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (messages && messages[0]) {
      console.log("👉 New message:", messages[0]);
      const from = messages[0].from;
      const text = messages[0].text?.body;

      console.log(`📲 Message from ${from}: ${text}`);

      // 👉 Get GPT reply
      const reply = await getGPTReply(text);

      // 👉 Send back to WhatsApp
      await sendMessage(from, reply);
    }
  } catch (err) {
    console.error("❌ Webhook Error:", err);
  }

  res.sendStatus(200);
});


// ✅ Manual Send Endpoint (Postman ke liye)
app.post("/send", async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: "to and message are required" });
  }
  const result = await sendMessage(to, message);
  res.json(result);
});

// ✅ Start server 
const PORT = process.env.PORT || 9002;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
