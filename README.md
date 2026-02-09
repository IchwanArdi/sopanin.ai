# Sopanin.ai 💎

> **Ubah Chat Kasar Jadi Sopan dalam 1 Klik.**
> *Aisten Etika Komunikasi khusus budaya Indonesia.*

Sopanin.ai adalah aplikasi berbasis AI yang membantu Anda mentransformasi pesan chat yang kasar atau kasual menjadi pesan yang sopan, profesional, dan beretika. Didesain khusus untuk konteks budaya Indonesia—mulai dari chat ke Dosen, Atasan (Bos), Orang Tua, hingga Teman.

## ✨ Fitur Utama

- 🧠 **Smart Context Detection:** Otomatis mendeteksi waktu (pagi/siang/malam) dan hari (contoh: salam khusus hari Jumat) untuk memberikan salam yang paling relevan.
- 📊 **Tone Indicator & Analysis:** Analisis tingkat kesopanan secara real-time dengan skor 1-5 dan feedback visual.
- 🔄 **Advanced AI Revision:** Ingin hasil yang lebih singkat? atau lebih formal? Gunakan fitur revisi dengan preset sekali klik atau berikan feedback custom ke AI.
- 📋 **Template & Management:** Simpan hasil transformasi favorit Anda sebagai template untuk digunakan kembali di masa depan.
- 🎙️ **Voice Input:** Malas mengetik? Gunakan fitur rekam suara (Web Speech API) untuk input pesan.
- 📱 **PWA & Mobile Ready:** Bisa diinstal sebagai aplikasi di HP (Home Screen) dengan UI yang sudah dioptimasi untuk swipe gesture.
- 🚀 **AI Thinking UI:** Loader dinamis dengan efek shimmer dan pulsing dots yang memberikan kesan AI sedang "berpikir".

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Engine:** [Google Gemini AI](https://ai.google.dev/) (`Gemma 3 27B`)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Memulai

### Prasyarat
- Node.js 18+
- [Gemini API Key](https://aistudio.google.com/)

### Instalasi Lokal

1. Clone repository:
   ```bash
   git clone https://github.com/username/sopanin-ai.git
   cd sopanin-ai
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Buat file `.env.local` di root folder dan tambahkan:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Jalankan server development:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📈 Analytics

Projek ini menggunakan Vercel Analytics untuk memantau performa dan statistik pengunjung secara anonim dan aman.

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---
*Dibuat dengan ❤️ untuk budaya Indonesia yang lebih beradab.*
