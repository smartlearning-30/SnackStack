import express from "express";
import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from 'url'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();

app.use(cors({
    origin: "https://snack-stack-coral.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running smoothly." });
});

app.post("/api/contact", async (req, res) => {
    const { from_name, from_email, message } = req.body;

    if (!from_name || !from_email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const templatePath = path.join(__dirname, "templates", "contact-admin.html");
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

        await transporter.sendMail({
            from: `"SnackStack Contact Form" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER,
            subject: `📩 New message from ${from_name}`,
            html,
        });

        const replyTemplatePath = path.join(__dirname, "templates", "auto-reply.html");
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
        res.status(500).json({ success: false, message: "Failed to send message." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));