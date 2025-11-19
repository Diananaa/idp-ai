# 🔧 Environment Variables Setup

## 📋 Quick Setup

1. **Copy template file:**
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

2. **Edit `.env` file** dengan nilai yang sesuai

3. **Restart dev server** jika sudah berjalan

---

## 📝 Environment Variables

### Required Variables

#### 1. Node Environment
```bash
NODE_ENV=development  # atau production
```
- **Development**: `synchronize: true` (auto sync schema)
- **Production**: `synchronize: false` (data safe)

#### 2. Database Configuration
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydb
```
**Default values** sesuai dengan `docker-compose.yml`

#### 3. JWT Secret
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
**Generate secure secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Optional Variables

#### Database Synchronize Override
```bash
# WARNING: Only set to 'true' if you really need it!
# In production, synchronize is automatically disabled for safety
DB_SYNC=true
```

---

## 📄 Complete .env Template

Buat file `.env` di root project dengan konten berikut:

```env
# ============================================
# Node Environment
# ============================================
NODE_ENV=development

# ============================================
# Database Configuration
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydb

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ============================================
# Database Synchronize Override (Optional)
# ============================================
# DB_SYNC=true
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** - sudah di `.gitignore`
2. **Use different values** untuk development dan production
3. **Keep JWT_SECRET secure** - jangan share atau commit
4. **Database credentials** harus match dengan `docker-compose.yml` atau database aktual

---

## 🐳 Docker Compose Setup

Jika menggunakan Docker Compose, pastikan environment variables match dengan `docker-compose.yml`:

```yaml
# docker-compose.yml
environment:
  POSTGRES_USER: myuser      # → DB_USER
  POSTGRES_PASSWORD: mypassword  # → DB_PASS
  POSTGRES_DB: mydb         # → DB_NAME
```

---

## ✅ Verification

Setelah setup, verifikasi dengan:

```bash
# Check database connection
npm run db:check

# Initialize database (first time only)
npm run db:init
```

---

## 🚨 Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL container running: `docker-compose up -d`
- Check credentials di `.env` match dengan `docker-compose.yml`
- Verify port 5432 tidak blocked

### JWT Error
- Pastikan `JWT_SECRET` sudah di-set
- Generate secret baru jika perlu

### Synchronize Warning
- Di production, `synchronize` otomatis disabled (aman)
- Jika perlu enable, set `DB_SYNC=true` (tidak disarankan)

