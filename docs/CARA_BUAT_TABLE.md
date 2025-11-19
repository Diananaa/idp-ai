# 📋 Cara Membuat Table Baru di Project IDP

## 🎯 Quick Answer
**TIDAK perlu** menjalankan `npm run db:init` setiap kali buat table baru! 

Karena `synchronize: true` di `data-source.ts`, TypeORM akan **otomatis** membuat/mengupdate table saat aplikasi berjalan.

---

## 📝 Langkah-langkah Membuat Table Baru

### 1. Buat Entity Baru
Buat file entity di `src/lib/entities/`, contoh: `Category.ts`

```typescript
import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date
}
```

### 2. Import Entity ke `data-source.ts`
Tambahkan import dan masukkan ke array `entities`:

```typescript
import { Category } from './entities/Category'

export const AppDataSource = new DataSource({
  // ... config lainnya
  entities: [User, DocumentType, Model, File, ProcessingJob, Category], // ← tambahkan di sini
})
```

### 3. Table Akan Otomatis Terbuat
Saat aplikasi jalan (dev server atau API dipanggil), TypeORM akan:
- ✅ Otomatis membuat table jika belum ada
- ✅ Menambahkan kolom baru jika ada perubahan
- ⚠️ **HATI-HATI**: Kolom yang dihapus dari entity **TIDAK** akan dihapus dari database

---

## 🔄 Kapan Perlu Jalankan `npm run db:init`?

### ✅ Perlu jalankan `db:init` jika:
1. **Pertama kali setup project** - untuk memastikan semua table terbuat
2. **Setelah clone project** - untuk setup database dari awal
3. **Database kosong/hilang** - untuk recreate semua table
4. **Mau test koneksi database** - untuk verify connection

### ❌ TIDAK perlu jalankan `db:init` jika:
1. **Hanya menambah table baru** - cukup buat entity dan import ke `data-source.ts`
2. **Mengubah kolom existing table** - cukup update entity, TypeORM akan sync otomatis
3. **Development biasa** - dev server akan handle sync otomatis

---

## 🚀 Workflow yang Disarankan

### Development (Otomatis)
```bash
# 1. Buat entity baru
# 2. Import ke data-source.ts
# 3. Jalankan dev server
npm run dev

# Table akan otomatis terbuat saat API pertama kali dipanggil
```

### Manual Sync (Opsional)
```bash
# Jika mau sync manual tanpa jalanin dev server
npm run db:init
```

---

## ⚠️ Catatan Penting

### 1. 🔒 **Synchronize AUTO-DISABLED di Production** (SAFE!)
Project ini sudah dilengkapi dengan **safety mechanism**:
- ✅ **Development** (`NODE_ENV=development`): `synchronize: true` → AUTO SYNC
- 🔒 **Production** (`NODE_ENV=production`): `synchronize: false` → **DATA AMAN!**
- ⚠️ **Override** (jika benar-benar perlu): Set `DB_SYNC=true` di environment variable

**Data di production TIDAK akan terhapus otomatis!** 🎉

### 2. TypeORM Synchronize Behavior (Development Only)
- ✅ Membuat table baru → **AUTO**
- ✅ Menambah kolom baru → **AUTO**
- ✅ Mengubah tipe kolom → **AUTO** (tapi bisa error jika ada data)
- ❌ Menghapus kolom → **TIDAK** otomatis dihapus
- ❌ Menghapus table → **TIDAK** otomatis dihapus

### 3. Untuk Production
- 🔒 **Synchronize sudah DISABLED otomatis** - data aman!
- 📝 Gunakan **migrations** (TypeORM migrations) untuk perubahan schema yang aman
- ✅ Atau gunakan manual SQL scripts untuk perubahan schema

---

## 📚 Contoh Lengkap

### Contoh: Membuat Table `Category`

**1. Buat file `src/lib/entities/Category.ts`:**
```typescript
import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date
}
```

**2. Update `src/lib/data-source.ts`:**
```typescript
import { Category } from './entities/Category' // ← tambahkan import

export const AppDataSource = new DataSource({
  // ... config
  entities: [User, DocumentType, Model, File, ProcessingJob, Category], // ← tambahkan di sini
})
```

**3. Restart dev server atau panggil API:**
```bash
npm run dev
```

**4. Table `category` akan otomatis terbuat!** ✅

---

## 🎓 Tips

1. **Selalu restart dev server** setelah menambah entity baru
2. **Cek console log** - akan ada pesan:
   - Development: `🔄 Schema synchronization: ENABLED`
   - Production: `🔒 Schema synchronization: DISABLED (production mode - data safe)`
3. **Gunakan `npm run db:check`** untuk verify table sudah terbuat
4. **Backup database** sebelum perubahan besar (best practice)
5. **Di production**, gunakan migrations atau manual SQL untuk perubahan schema

## 🔐 Production Safety

### Environment Variables
```bash
# Development (default)
NODE_ENV=development  # synchronize: true (auto)

# Production (default)
NODE_ENV=production    # synchronize: false (safe!)

# Override (hati-hati!)
DB_SYNC=true           # Force enable synchronize (tidak disarankan di production)
```

### Console Logs
Saat aplikasi start, akan muncul log:
- **Development**: `🔄 Schema synchronization: ENABLED (development mode)`
- **Production**: `🔒 Schema synchronization: DISABLED (production mode - data safe)`

