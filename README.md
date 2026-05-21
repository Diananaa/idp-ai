# IDP - Intelligent Document Processing

Aplikasi Next.js untuk intelligent document processing dengan PostgreSQL, TypeORM, dan integrasi Google AI Studio.

Kalau kamu ingin belajar konsep dan alur Docker project ini pelan-pelan, baca [Tutorial Docker Project IDP](docs/DOCKER_TUTORIAL.md).

## Menjalankan Dengan Docker

Pastikan Docker Desktop sudah berjalan, lalu jalankan dari root project:

```bash
docker compose up --build
```

Setelah container siap, buka aplikasi di:

```text
http://localhost:3000
```

`docker-compose.yml` akan menjalankan dua service:

- `app`: aplikasi Next.js di port `3000`
- `postgres`: database PostgreSQL di port `5432`

Untuk mode Docker lokal, database memakai konfigurasi berikut:

```text
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=testIDP
```

Schema database dibuat otomatis saat app terhubung karena `DB_SYNC=true` di `docker-compose.yml`. Ini nyaman untuk lokal/development, tapi untuk production sebaiknya matikan `DB_SYNC` dan gunakan migration.

## Environment Docker

Compose akan memakai nilai dari file `.env` jika ada. Buat dari contoh:

```bash
copy .env.example .env
```

Minimal yang biasanya perlu diganti:

```text
JWT_SECRET=isi-dengan-secret-yang-kuat
API_KEY_AI_STUDIO_GOOGLE=isi-api-key-google-ai-studio
```

Jika `API_KEY_AI_STUDIO_GOOGLE` kosong, aplikasi tetap bisa jalan, tetapi fitur OCR/AI yang memanggil Gemini akan error saat digunakan.

## Perintah Docker Yang Sering Dipakai

Jalankan container di background:

```bash
docker compose up --build -d
```

Lihat log aplikasi:

```bash
docker compose logs -f app
```

Lihat log database:

```bash
docker compose logs -f postgres
```

Stop container tanpa menghapus data:

```bash
docker compose down
```

Reset database dan upload lokal Docker:

```bash
docker compose down -v
```

Build ulang image dari awal:

```bash
docker compose build --no-cache app
docker compose up -d
```

## Menjalankan Tanpa Docker

Buat `.env`, lalu jalankan PostgreSQL dan app secara lokal:

```bash
copy .env.example .env
yarn install
yarn db:init
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000).
