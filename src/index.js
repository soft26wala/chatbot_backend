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
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.Groq_API_KEY}`, // ✅ ENV me rakho
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // ✅ fast free model
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Groq API Error:", data);
      return "⚠️ Sorry, something went wrong with Groq API.";
    }

    // ✅ extract reply
    return data.choices?.[0]?.message?.content || "⚠️ No reply from Groq.";
  } catch (err) {
    console.error("❌ GPT error response:", err);
    return "⚠️ Sorry, I couldn't understand.";
  }
}

const webhook = require('./routes/webhook')
const send_template = require('./routes/send-template')

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// ✅ Webhook Verification
// app.get("/webhook", (req, res) => {
 
//   const VERIFY_TOKEN = "chatbotgpt"; // same jo Meta dashboard me dala

//   const mode = req.query["hub.mode"];
//   const challenge = req.query["hub.challenge"];
//   const token = req.query["hub.verify_token"];

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// });

// ✅ Incoming Messages
// app.post("/webhook", async (req, res) => {
//   try {
//     const entry = req.body.entry?.[0];
//     const changes = entry?.changes?.[0];
//     const messages = changes?.value?.messages;

//     if (messages && messages[0]) {
//       console.log("👉 New message:", messages[0]);
//       const from = messages[0].from;
//       const text = messages[0].text?.body;


//       // 👉 Example GPT integration (or custom logic)
//       const reply = await getGPTReply(text);

//       // 👉 Send back to WhatsApp
//       await sendMessage(from, reply);
//     }
//   } catch (err) {
//     console.error("❌ Webhook Error:", err);
//   }

//   res.sendStatus(200);
// });



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
