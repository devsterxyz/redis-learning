import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function OTPKey(phoneNumber) {
  return `otp:${phoneNumber}`;
}

app.post("/otp", async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(OTPKey(phoneNumber), otp, "EX", 30);
  res.json({ message: "OTP sent", otp });
});

app.post("/otp/verify", async (req, res) => {
  const { phoneNumber, otp } = req.body;
  const savedOtp = await redis.get(OTPKey(phoneNumber));
  if (!savedOtp) {
    return res.status(400).json({ message: "OTP not found" });
  }
  if (savedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await redis.del(OTPKey(phoneNumber));
  res.json({ message: "OTP verified successfully" });
});

app.get("/otp/:phoneNumber/ttl", async (req, res) => {
  const ttl = await redis.ttl(OTPKey(req.params.phoneNumber));
  res.json({ ttl });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
