# Jumbo Commercial Backend

## 📁 โครงสร้างโปรเจค

```
jumbo-commercial-back-end/
├── node_modules/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── configs/
│   ├── controllers/
│   │   ├── analytics.controller.ts
│   │   ├── category.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── order.controller.ts
│   │   ├── product.controller.ts
│   │   └── unit.controller.ts
│   ├── generated/
│   ├── libs/
│   ├── middlewares/
│   ├── repositories/
│   │   ├── analytics.repository.ts
│   │   ├── category.repository.ts
│   │   ├── customer.repository.ts
│   │   ├── order.repository.ts
│   │   ├── product.repository.ts
│   │   └── unit.repository.ts
│   ├── routes/
│   │   ├── analytics.routes.ts
│   │   ├── category.route.ts
│   │   ├── customer.route.ts
│   │   ├── index.route.ts
│   │   ├── order.route.ts
│   │   ├── product.route.ts
│   │   └── unit.route.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── category.service.ts
│   │   ├── customer.service.ts
│   │   ├── order.service.ts
│   │   ├── product.service.ts
│   │   └── unit.service.ts
│   ├── types/
│   ├── utils/
│   │   ├── index.ts
│   │   └── .env
│   └── .gitignore
├── package.json
└── tsconfig.json
```

## 🛠 เทคโนโลยีที่ใช้

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **Prisma ORM** - Database ORM
- **ExcelJS** - Excel file processing
- **CORS** - Cross-Origin Resource Sharing

## 📦 การติดตั้ง

### ความต้องการของระบบ

- Node.js (version 18 หรือสูงกว่า)
- npm หรือ yarn
- PostgreSQL/MySQL (ตามที่ตั้งค่าใน Prisma)

### ขั้นตอนการติดตั้ง

1. Clone repository

```bash
git clone <repository-url>
cd jumbo-commercial-back-end
```

2. ติดตั้ง dependencies

```bash
npm install
```

3. ตั้งค่า environment variables

สร้างไฟล์ `.env` ในโฟลเดอร์ root และเพิ่มค่าต่อไปนี้:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=8080
```

4. Generate Prisma Client

```bash
npm run prisma:generate
```

5. Run database migrations

```bash
npm run prisma:migrate
```

## 🚀 การใช้งาน

### Development Mode

```bash
npm run dev
```

Server จะรันที่ `http://localhost:8080`

### Production Build

```bash
npm run build
npm start
```

### Scripts ที่มีให้ใช้งาน

- `npm run dev` - รัน development server พร้อม hot reload
- `npm run build` - Build TypeScript เป็น JavaScript
- `npm start` - รัน production server
- `npm run lint` - ตรวจสอบ code style ด้วย ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - สร้าง migration ใหม่
- `npm run prisma:deploy` - Deploy migrations ไปยัง production

## 🔄 Git Workflow

### Branch Strategy

โปรเจคนี้ใช้ 2 main branches:

- `main` - Production branch (stable code)
- `dev` - Development branch (สำหรับพัฒนา)

### Workflow การทำงาน

#### 1. เริ่มต้นทำงาน

```bash
# ดึง code ล่าสุดจาก dev branch
git checkout dev
git pull origin dev
```

#### 2. สร้าง Feature Branch (Optional แต่แนะนำ)

```bash
# สร้าง branch ใหม่จาก dev
git checkout -b feature/your-feature-name
```

#### 3. ทำงานและ Commit Changes

```bash
# เพิ่มไฟล์ที่แก้ไข
git add .

# หรือเลือกเฉพาะไฟล์
git add src/controllers/product.controller.ts

# Commit พร้อม message ที่ชัดเจน
git commit -m "feat: add product filter functionality"
```

#### 4. Rebase กับ Dev Branch

```bash
# ดึง code ล่าสุดจาก dev
git fetch origin dev

# Rebase branch ของคุณกับ dev
git rebase origin/dev

# หากมี conflict ให้แก้ไข conflict แล้วรัน
git add .
git rebase --continue

# หากต้องการยกเลิก rebase
git rebase --abort
```

#### 5. Push Code

```bash
# Push feature branch ครั้งแรก
git push origin feature/your-feature-name

# หาก rebase แล้วต้อง force push (ระวังใช้)
git push origin feature/your-feature-name --force-with-lease
```

#### 6. Create Pull Request

- ไปที่ GitHub/GitLab
- สร้าง Pull Request จาก `feature/your-feature-name` → `dev`
- รอการ review และ approve
- Merge เข้า dev branch

#### 7. Deploy to Production

```bash
# เมื่อ dev branch พร้อม deploy
git checkout main
git pull origin main

# Merge dev เข้า main
git merge dev

# หรือ rebase (ถ้าต้องการ history เป็นเส้นตรง)
git rebase dev

# Push to main
git push origin main
```

### Commit Message Convention

ใช้ format ดังนี้:

```
<type>: <subject>

<body> (optional)
```

**Types:**

- `feat` - Feature ใหม่
- `fix` - แก้ bug
- `docs` - แก้ไข documentation
- `style` - แก้ไข formatting, ไม่กระทบ logic
- `refactor` - Refactor code
- `test` - เพิ่ม tests
- `chore` - งานอื่นๆ (update dependencies, config)

**ตัวอย่าง:**

```bash
git commit -m "feat: add customer search endpoint"
git commit -m "fix: resolve order calculation bug"
git commit -m "docs: update README with API documentation"
git commit -m "refactor: optimize database queries in product service"
```

