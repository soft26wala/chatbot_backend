import express from "express";

const router = express.Router();


// GET /users/
router.get("/", (req, res)=>{
     
  const VERIFY_TOKEN = "chatbotgpt"; // same jo Meta dashboard me dala

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
})




router.post("/", async (req, res) => {
   try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (messages && messages[0]) {
      console.log("👉 New message:", messages[0]);
      const from = messages[0].from;
      const text = messages[0].text?.body;


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




// module.exports = router;
export default router;