# Tutorial Docker Untuk Project IDP

Tutorial ini menjelaskan cara project ini dijalankan dengan Docker, bukan cuma daftar command. Fokusnya supaya kamu paham peran `Dockerfile`, `docker-compose.yml`, database, environment variable, dan cara debug.

## 1. Gambaran Besar

Project ini butuh dua proses utama:

- Aplikasi Next.js, yaitu service `app`
- Database PostgreSQL, yaitu service `postgres`

Kalau jalan manual, kamu biasanya perlu:

```bash
yarn install
yarn build
yarn start
```

Lalu kamu juga harus memastikan PostgreSQL sudah hidup dan environment database benar.

Dengan Docker Compose, semua itu dirapikan jadi:

```bash
docker compose up --build
```

Compose akan build image aplikasi, menyalakan database, menunggu database sehat, lalu menjalankan aplikasi.

## 2. File Yang Dipakai

Ada empat file penting untuk Docker:

- `Dockerfile`: resep untuk membuat image aplikasi Next.js.
- `docker-compose.yml`: pengatur beberapa container, dalam project ini `app` dan `postgres`.
- `.dockerignore`: daftar file yang tidak dikirim ke proses build Docker.
- `next.config.js`: diset `output: 'standalone'` supaya hasil build Next.js cocok untuk container production.

## 3. Cara Membaca Dockerfile

`Dockerfile` project ini memakai multi-stage build. Artinya proses build dibagi jadi beberapa tahap agar image akhirnya lebih kecil dan bersih.

### Stage `deps`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
```

Bagian ini hanya install dependency. Docker akan menyimpan cache dari langkah ini selama `package.json` dan `yarn.lock` tidak berubah.

### Stage `builder`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
```

Bagian ini menyalin source code lalu menjalankan `yarn build`. Output Next.js akan masuk ke folder `.next`.

### Stage `runner`

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
```

Ini image akhir yang benar-benar dijalankan. Isinya hanya hasil build yang dibutuhkan untuk production.

```dockerfile
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Aplikasi dijalankan sebagai user non-root (`nextjs`) supaya lebih aman.

## 4. Cara Membaca docker-compose.yml

`docker-compose.yml` punya dua service.

### Service `postgres`

```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: testIDP
```

Ini membuat database PostgreSQL dengan:

```text
user: postgres
password: postgres
database: testIDP
```

Data database disimpan di volume:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

Jadi kalau container dimatikan dengan `docker compose down`, data tetap aman.

### Service `app`

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
```

Bagian ini berarti image `app` dibuat dari `Dockerfile` di root project.

```yaml
ports:
  - "3000:3000"
```

Artinya port `3000` di laptop kamu diarahkan ke port `3000` di container. Karena itu aplikasi bisa dibuka dari:

```text
http://localhost:3000
```

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

Bagian ini membuat `app` menunggu PostgreSQL siap dulu sebelum mulai jalan.

## 5. Kenapa DB_HOST Pakai postgres?

Saat aplikasi jalan di laptop langsung, host database biasanya:

```text
DB_HOST=localhost
```

Tapi saat aplikasi jalan di container, `localhost` berarti container aplikasi itu sendiri, bukan container database.

Di Docker Compose, setiap service bisa dipanggil memakai nama servicenya. Karena service database bernama `postgres`, maka app harus memakai:

```text
DB_HOST=postgres
```

Ini salah satu konsep Docker yang paling penting.

## 6. Environment Variable

Di compose, app diberi environment seperti ini:

```yaml
DB_HOST: postgres
DB_PORT: 5432
DB_USER: postgres
DB_PASS: postgres
DB_NAME: testIDP
JWT_SECRET: ${JWT_SECRET:-change-this-jwt-secret-for-local-docker}
API_KEY_AI_STUDIO_GOOGLE: ${API_KEY_AI_STUDIO_GOOGLE:-}
```

Format ini:

```text
${NAMA_ENV:-nilai_default}
```

Berarti Docker akan memakai nilai dari `.env` kalau ada. Kalau tidak ada, Docker memakai nilai default setelah `:-`.

Contoh `.env` lokal:

```text
JWT_SECRET=secret-lokal-yang-kuat
API_KEY_AI_STUDIO_GOOGLE=api-key-google-kamu
```

## 7. Cara Menjalankan Dari Nol

Pastikan Docker Desktop sudah hidup, lalu jalankan:

```bash
docker compose up --build
```

Tunggu sampai log aplikasi menunjukkan server sudah listening. Setelah itu buka:

```text
http://localhost:3000
```

Kalau mau jalan di background:

```bash
docker compose up --build -d
```

## 8. Cara Melihat Log

Lihat semua log:

```bash
docker compose logs -f
```

Lihat log aplikasi saja:

```bash
docker compose logs -f app
```

Lihat log database saja:

```bash
docker compose logs -f postgres
```

## 9. Cara Masuk Ke Container

Masuk ke container app:

```bash
docker compose exec app sh
```

Cek environment di container app:

```bash
printenv
```

Keluar dari container:

```bash
exit
```

## 10. Cara Cek Database

Masuk ke PostgreSQL dari container database:

```bash
docker compose exec postgres psql -U postgres -d testIDP
```

Lihat daftar table:

```sql
\dt
```

Keluar dari `psql`:

```sql
\q
```

## 11. Stop, Restart, Dan Reset

Stop container tanpa menghapus data:

```bash
docker compose down
```

Jalankan lagi:

```bash
docker compose up -d
```

Reset semua data Docker volume:

```bash
docker compose down -v
```

Pakai `down -v` hanya kalau kamu memang mau database dan upload lokal Docker ikut hilang.

## 12. Build Ulang Jika Ada Perubahan

Kalau kamu mengubah source code dan ingin rebuild image:

```bash
docker compose up --build
```

Kalau cache Docker terasa bermasalah:

```bash
docker compose build --no-cache app
docker compose up -d
```

## 13. Debug Error Umum

### Port 3000 sudah dipakai

Error biasanya mirip "port is already allocated".

Solusi:

```bash
docker compose down
```

Atau ubah port di `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"
```

Lalu buka:

```text
http://localhost:3001
```

### App tidak bisa konek database

Cek log:

```bash
docker compose logs -f app
docker compose logs -f postgres
```

Pastikan environment app memakai:

```text
DB_HOST=postgres
```

Bukan `localhost`.

### OCR atau Gemini error

Pastikan `.env` berisi:

```text
API_KEY_AI_STUDIO_GOOGLE=api-key-google-kamu
```

Lalu restart:

```bash
docker compose up -d --build
```

## 14. Alur Mental Docker Compose

Saat kamu menjalankan:

```bash
docker compose up --build
```

Urutannya kira-kira:

1. Docker membaca `docker-compose.yml`.
2. Docker melihat service `app` harus di-build dari `Dockerfile`.
3. Docker menjalankan langkah-langkah di `Dockerfile`.
4. Docker membuat container `postgres`.
5. Docker menunggu healthcheck PostgreSQL berhasil.
6. Docker membuat container `app`.
7. App membaca environment variable.
8. App konek ke database memakai host `postgres`.
9. App bisa diakses dari browser lewat `localhost:3000`.

Kalau kamu paham alur ini, debugging Docker akan jauh lebih gampang.
