import express from "express";

const router = express.Router();




router.post("/", async (req, res) => {
    try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: req.body.to, // e.g. "919876543210"
          type: "template",
          template: {
            name: "testing", // 👈 Meta में approved template name
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: "Hello Anmol 👋"
                  },
                  {
                    type: "currency",
                    currency: {
                      fallback_value: "$100.99",
                      code: "USD",
                      amount_1000: 100990
                    }
                  },
                  {
                    type: "date_time",
                    date_time: {
                      fallback_value: "February 25, 1977",
                      day_of_week: 5,
                      year: 1977,
                      month: 2,
                      day_of_month: 25,
                      hour: 15,
                      minute: 33,
                      calendar: "GREGORIAN"
                    }
                  }
                ]
              }
            ]
          }
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// module.exports = router;
export default router;
