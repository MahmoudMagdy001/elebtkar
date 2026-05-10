# 🚀 وكالة ابتكار | Elebtkar Agency

**وكالة ابتكار للحلول التقنية والبرمجية - نبتكر مستقبلك الرقمي بأحدث التقنيات.**

This is the official web application for **Elebtkar Agency**, a cutting-edge technical solution provider based in Saudi Arabia. Built with modern web technologies, focusing on performance, SEO, and premium user experience.

---

## ✨ Features

- 💎 **Premium UI/UX**: Stunning design with smooth animations using Framer Motion.
- 📱 **Fully Responsive**: Optimized for all devices (Mobile, Tablet, Desktop).
- 🔍 **SEO Optimized**: Dynamic metadata management for every page via `react-helmet-async`.
- ⚡ **Lightning Fast**: Powered by Vite and React 19 for minimal bundle sizes and fast HMR.
- 🛠️ **Admin Dashboard**: Custom-built dashboard to manage blog posts, services, pricing, and partners.
- 🗄️ **Supabase Backend**: Real-time database and authentication.
- 💳 **Payment Integration**: Secure payment processing via Moyasar.
- 🌍 **RTL Support**: Native Arabic support with right-to-left layout.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State & Backend**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/), [Phosphor Icons](https://phosphoricons.com/)
- **SEO**: [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Routing**: [React Router Dom v7](https://reactrouter.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd elebtkar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Directory Structure

```
lib/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, Fonts, Styles
│   ├── components/      # Reusable UI components (SEO, Navbar, Footer, etc.)
│   ├── pages/           # Page components (Home, Blog, Admin, etc.)
│   ├── sections/        # Section-based components for pages
│   ├── utils/           # Helper functions, Supabase client
│   ├── App.jsx          # Main application component & routes
│   └── main.jsx         # Entry point
└── vercel.json          # Deployment configuration
```

---

## 📄 License

This project is private and proprietary to **وكالة ابتكار**.

---

## 📞 Contact

- **Website**: [elebtikar-sa.com](https://elebtikar-sa.com)
- **Email**: Info@elebtikar-sa.com
- **Phone**: +966 17 510 7335
