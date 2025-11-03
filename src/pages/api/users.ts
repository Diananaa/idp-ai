import type { NextApiRequest, NextApiResponse } from "next";
import { initDB } from "@/lib/db";
import { AppDataSource } from "@/lib/data-source";
import { User } from "@/lib/entities/User";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await initDB();
  } catch (e) {
    console.error("Error initializing DB:", e);
    return res.status(500).json({ error: "Failed to connect to database" });
  }

  const repo = AppDataSource.getRepository(User);

  if (req.method === "GET") {
    try {
      const users = await repo.find();
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    try {
      const { email, password } = req.body || {};

      if (!password || !email) {
        return res.status(400).json({ error: "Password and email are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      // Implement simple authentication logic for login and return a bearer token

      // For this, make this POST endpoint act as "login" if email+password match, else error
      // You can use a simple JWT for the bearer token

      // NOTE: If you want to keep separate from register, consider checking request.body.mode or other field
      // But per request, we just do auth/login here

      // Check user exists and password matches
      const user = await repo.findOne({ where: { email: String(email).trim().toLowerCase() } });

      if (!user || user.password !== String(password).trim()) {
        return res.status(401).json({ error: "Password atau email salah" });
      }

      // JWT configuration
      const jwtSecret = process.env.JWT_SECRET || "very-secret";
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      // Respond with the bearer token and basic user info
      return res.status(200).json({
        token: `Bearer ${token}`,
        user: payload
      });

      
  }
  catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}



