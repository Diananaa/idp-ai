import { AppDataSource } from "@/lib/data-source";
import { initDB } from "@/lib/db";
import { Model } from "@/lib/entities/Model";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await initDB();
    } catch (error) {
        console.error("Error initializing DB:", error);
        return res.status(500).json({ error: "Failed to connect to database" });
    }
    const repo = AppDataSource.getRepository(Model);
    if (req.method === "GET") {
        try {
            const models = await repo.find({
                order: {
                    name: "ASC",
                },
            })
            return res.status(200).json(models);
        } catch (error) {
            console.error("Error fetching models:", error);
            return res.status(500).json({ error: "Failed to fetch models" });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}