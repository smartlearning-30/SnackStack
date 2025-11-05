import express from "express";
import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// === Contact API Route ===
app.post("/api/contact", async (req, res) => {
  const { from_name, from_email, message } = req.body;
  console.log({ from_name, from_email, message });

  // basic validation
  if (!from_name || !from_email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const templatePath = path.join(process.cwd(), "templates", "contact-admin.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    const date = new Date().toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    html = html
      .replace("{{from_name}}", from_name)
      .replace("{{from_email}}", from_email)
      .replace("{{message}}", message)
      .replace("{{date}}", date);

    // === 1️⃣ Send to Admin ===
    const adminInfo = await transporter.sendMail({
      from: `"SnackStack Contact Form" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: `📩 New message from ${from_name}`,
      html,
    });

    // === 2️⃣ Send Auto-Reply to User ===
    const replyTemplatePath = path.join(process.cwd(), "templates", "auto-reply.html");
    let replyHTML = fs.readFileSync(replyTemplatePath, "utf-8");

    replyHTML = replyHTML
      .replace("{{from_name}}", from_name)
      .replace("{{message}}", message);


    await transporter.sendMail({
        from: `"SnackStack Support" <${process.env.MAIL_USER}>`,
        to: from_email,
        replyTo: process.env.MAIL_USER,
        subject: "Thanks for contacting SnackStack! 🍔",
        html: replyHTML,
    });

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error while sending emails:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
