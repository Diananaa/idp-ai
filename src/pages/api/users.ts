import type { NextApiRequest, NextApiResponse } from "next";
import { initDB } from "@/lib/db";
import { AppDataSource } from "@/lib/data-source";
import { User } from "@/lib/entities/User";

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
      const { name, email } = req.body || {};

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const newUser = repo.create({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
      });

      const saved = await repo.save(newUser);
      return res.status(201).json(saved);
    } catch (error: any) {
      if (error?.code === "23505" || error?.message?.includes("duplicate")) {
        return res.status(409).json({ error: "Email already exists" });
      }
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}


