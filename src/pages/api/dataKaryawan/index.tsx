import { AppDataSource } from "@/lib/data-source"
import { DataKaryawan } from "@/lib/entities/DataKaryawan"
import { NextApiRequest, NextApiResponse } from "next"
import { initDB } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Inisialisasi Database (berlaku untuk semua method)
    try {
        await initDB();
    } catch (error) {
        console.error('Error initializing DB:', error);
        return res.status(500).json({ error: 'Failed to connect to database' });
    }

    const repo = AppDataSource.getRepository(DataKaryawan);

    // 2. Pisahkan logika berdasarkan Method
    switch (req.method) {
        case 'GET':
            try {
                const dataKaryawan = await repo.find();
                return res.status(200).json(dataKaryawan);
            } catch (error) {
                return res.status(500).json({ error: 'Failed to fetch data' });
            }

        case 'POST':
            try {
                const { nama, alamat, nip, jabatan } = req.body;

                // Validasi sederhana agar tidak error saat .trim()
                if (!nama || !alamat || !nip || !jabatan) {
                    return res.status(400).json({ error: 'Data tidak lengkap' });
                }

                const dataKaryawan = repo.create({
                    nama: nama.trim(),
                    alamat: alamat.trim(),
                    nip: nip.trim(),
                    jabatan: jabatan.trim()
                });

                const saved = await repo.save(dataKaryawan);
                return res.status(201).json(saved);
            } catch (error) {
                console.error('Error saving data:', error);
                return res.status(500).json({ error: 'Failed to save data' });
            }

        default:
            // Jika method bukan GET atau POST
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
}