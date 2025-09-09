import express from "express";

const router = express.Router();




router.post("/", async (req, res) => {
     try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: req.body.to,  // "91XXXXXXXXXX"
          type: "template",
          template: {
            name: req.body.template_name, // "order_update"
            language: { code: req.body.language_code || "en_US" },
            components: req.body.components || [] // optional parameters
          }
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
