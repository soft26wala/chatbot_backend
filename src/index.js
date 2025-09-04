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
// ✅ Send message function
async function sendMessage(to, message) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: {
            preview_url: false,
            body: message, // dynamic reply
          },
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
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions -s", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.Groq_API_KEY}`, // env se lo
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      console.error("❌ GPT error response:", data);
      return "Sorry, I couldn’t understand.";
    }
  } catch (err) {
    console.error("❌ GPT fetch error:", err);
    return "Sorry, I couldn’t understand.";
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

      // 👉 Example GPT integration (or custom logic)
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
