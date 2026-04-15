# Tarif Evim

Tarif Evim, tarif paylaşımı ve yönetimi için geliştirilen full-stack bir uygulamadır.

- Frontend: React
- Backend: Node.js + Express
- Veritabanı: MongoDB
- Kimlik doğrulama: JWT

## Proje Yapısı

```text
Tarif-Evim/
	tarif-evim-backend/
	tarif-evim-frontend/
```

## Gereksinimler

- Node.js 18+
- npm 9+
- MongoDB bağlantı bilgisi

## Kurulum

### 1) Bağımlılıkları yükle

Backend:

```bash
cd tarif-evim-backend
npm install
```

Frontend:

```bash
cd ../tarif-evim-frontend
npm install
```

## Uygulamayı Çalıştırma

Bu repoda kök klasörde `package.json` yoktur. Komutları ilgili alt klasörde çalıştırmalısın.

### Backend

```bash
cd tarif-evim-backend
npm run start
```

### Frontend

```bash
cd tarif-evim-frontend
npm install
npm start
```

Alternatif olarak kökten çalıştırmak için:

```bash
npm --prefix tarif-evim-backend start
npm --prefix tarif-evim-frontend start
```

## Build

Frontend production build:

```bash
cd tarif-evim-frontend
npm run build
```

## Kategori Standardı (Backend = Frontend)

Kategori alanı iki tarafta da birebir aynı olacak şekilde tanımlıdır:

1. Tavuk kategorisi
2. Et kategorisi
3. Sebze kategorisi
4. Baklagiller
5. Deniz mahsülleri
6. Corba
7. Hamur işleri
8. Makarna
9. Glutensiz kategori
10. Vegan kategorisi
11. Atıştırmalık ve Tatlı
12. Diyetisyen onaylı tarifler

## Temel API Uç Noktaları

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `DELETE /api/auth/me`
- `GET /api/recipes`
- `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`
- `POST /api/recipes/:id/approve`
