# Gen-Edu - Educational Platform

Gen-Edu adalah platform pendidikan modern yang menggabungkan notebook interaktif, sistem quiz, dan manajemen pengguna yang komprehensif. Platform ini dibangun dengan Next.js dan menyediakan pengalaman belajar yang interaktif untuk siswa, guru, dan administrator.

## 🚀 Fitur Utama

### 📚 Sistem Notebook
- Editor notebook interaktif dengan dukungan Markdown
- Sistem cell untuk code dan konten
- Sharing dan kolaborasi notebook
- Template notebook untuk berbagai subjek
- Metadata lengkap dengan tags, difficulty level, dan estimasi waktu

### 📝 Sistem Quiz
- Pembuat quiz dengan berbagai tipe pertanyaan
- Sistem scoring dan analytics
- Template quiz dan kategori
- Tracking completion rate dan performance

### 👥 Manajemen Pengguna
- Role-based access control (Student, Teacher, Admin)
- Sistem autentikasi dan verifikasi email
- Profile management dengan preferences
- Subscription management (Free, Premium, Pro)

### 🔧 Panel Admin
- [User management](components/admin/user-management.tsx) yang komprehensif
- Analytics dan statistik platform
- Content moderation dan template management

### 🤖 AI Integration
- [OCR processing](lib/quiz-gen/ocr.ts) dengan Mistral AI untuk ekstraksi konten dari PDF
- Auto-generation konten pembelajaran

## 🛠️ Tech Stack

- **Framework**: Next.js 14 dengan App Router
- **Database**: MongoDB dengan Mongoose ODM
- **Styling**: Tailwind CSS dengan shadcn/ui components
- **Authentication**: JWT-based dengan middleware protection
- **AI Integration**: Mistral AI untuk OCR dan content generation
- **Language**: TypeScript

## 📁 Struktur Proyek

```
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── admin/            # Admin-specific components
├── lib/                   # Utilities dan configurations
│   ├── models/           # MongoDB/Mongoose models
│   └── quiz-gen/         # AI quiz generation
├── data/                  # Sample data dan mock objects
├── hooks/                 # Custom React hooks
├── public/               # Static assets
├── scripts/              # Database scripts dan utilities
└── styles/               # Global styles
```

## 🏗️ Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/gen-edu.git
   cd gen-edu
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Isi file `.env` dengan konfigurasi yang diperlukan:
   ```env
   MONGODB_URI=mongodb://localhost:27017/genedu
   JWT_SECRET=your-jwt-secret
   MISTRAL_API_KEY=your-mistral-api-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Setup database**
   ```bash
   # Buat admin user
   node scripts/create-admin-user.js
   
   # Buat test user (optional)
   node scripts/create-test-user.js
   ```

5. **Jalankan development server**
   ```bash
   pnpm dev
   ```

## 🚀 Deployment

### Build Production
```bash
pnpm build
pnpm start
```

### Environment Configuration
Pastikan environment variables berikut telah dikonfigurasi untuk production:
- `MONGODB_URI`: Connection string MongoDB
- `JWT_SECRET`: Secret key untuk JWT tokens
- `MISTRAL_API_KEY`: API key untuk Mistral AI
- `NEXTAUTH_SECRET`: Secret untuk NextAuth
- `NEXTAUTH_URL`: URL aplikasi production

## 📊 Models Database

### User Model
- [User](lib/models/User.ts): Manajemen user dengan role-based access
- Support untuk subscription plans dan preferences
- Profile management dengan bio, institution, dan subjects

### Notebook Model  
- [Notebook](lib/models/Notebook.ts): Interactive notebooks dengan cell system
- Sharing permissions dan collaboration features
- Template system dan categorization

### Quiz Model
- [Quiz](lib/models/Quiz.ts): Comprehensive quiz system
- Multiple question types dan scoring
- Analytics dan completion tracking

## 🔐 Authentication & Authorization

Platform menggunakan JWT-based authentication dengan [middleware protection](middleware.ts):

- **Protected Routes**: `/dashboard`, `/notebook`, `/quiz`, `/profile`, `/settings`, `/analytics`
- **Public Routes**: `/`, `/login`, `/register`, `/onboarding`
- **Admin Routes**: Akses terbatas untuk role admin

## 🎨 UI Components

Platform menggunakan shadcn/ui dengan Tailwind CSS:
- Design system yang konsisten
- Dark/light theme support
- Responsive design untuk semua device
- [Custom markdown styling](app/globals.css) untuk konten

## 🧪 Testing

### Admin Testing
Gunakan [admin-test.html](public/admin-test.html) untuk testing authentication dan admin functions.

### Database Testing
```bash
node check-database.js
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 👨‍💻 Authors

- **Gathan Ghifari Rachwiyono** 
- **Muhammad Ellbendl Satria**

## 🔗 Links

- **Documentation**: Coming soon
- **Demo**: Coming soon
- **Support**: Create an issue in this repository

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Pastikan MongoDB running
   - Check connection string di `.env`
   - Run `node check-database.js` untuk test koneksi

2. **Authentication Issues**
   - Clear browser cookies
   - Check JWT_SECRET di environment
   - Verify user creation dengan admin scripts

3. **Build Issues**
   - Pastikan semua dependencies ter-install
   - Check TypeScript errors
   - Verify environment variables

---

⭐ Jika proyek ini membantu, berikan star di repository!