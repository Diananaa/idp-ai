import type { NextApiRequest, NextApiResponse } from "next";
import { initDB } from "@/lib/db";
import { AppDataSource } from "@/lib/data-source";
import { DocumentType } from "@/lib/entities/DocumentType";

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

  const repo = AppDataSource.getRepository(DocumentType);

  if (req.method === "GET") {
    try {
      const documentTypes = await repo.find({
        order: {
          name: "ASC",
        },
      });
      return res.status(200).json(documentTypes);
    } catch (error) {
      console.error("Error fetching document types:", error);
      return res.status(500).json({ error: "Failed to fetch document types" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}

