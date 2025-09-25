<div align="center">
  <img src="public/logo.png" alt="HoT🔥sHoP Logo" width="200"/>
  
  # HoT🔥sHoP - E-commerce Platform
  
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-6DB33F)](https://spring.io/projects/spring-boot)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


  🛍️ A modern, full-featured e-commerce platform built with cutting-edge technologies
</div>

## 🌟 Key Features

<details>
<summary>💫 Customer Experience</summary>

- **Seamless Authentication**
  - Social login integration 
  - JWT-based secure sessions
  - Password recovery system

- **Smart Shopping**
  - AI-powered product recommendations
  - Real-time inventory tracking
  - Advanced search with filters
  - Voice search capability

- **Secure Transactions**
  - Multiple payment gateways
  - SSL/TLS encryption
  - Fraud detection
</details>

<details>
<summary>🛒 Shopping Features</summary>

- **Product Management**
  - Multi-image product views
  - Dynamic pricing system
  - Bulk ordering options
  - Wishlist functionality

- **Cart & Checkout**
  - One-click checkout
  - Guest checkout option
  - Multiple shipping methods
  - Order tracking
</details>

<details>
<summary>⚡ Technical Excellence</summary>

- **Performance**
  - 90+ Lighthouse score
  - Image optimization
  - Lazy loading
  - Code splitting

- **Security**
  - CSRF protection
  - Rate limiting
  - Input sanitization
  - XSS prevention
</details>

## 🚀 Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=spring" width="48" height="48" alt="Spring Boot" />
      <br>Spring Boot
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
      <br>Next.js
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=ts" width="48" height="48" alt="TypeScript" />
      <br>TypeScript
    </td>
    <td align="center" width="96">
      <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
      <br>Tailwind
    </td>
  </tr>
</table>

## 🏗️ Architecture

```mermaid
graph TD
    A[Client] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Spring Boot Backend]
    D --> E[PostgreSQL]
    D --> F[Redis Cache]
```

## 🚦 Getting Started

### Prerequisites

Make sure you have installed:

```bash
node -v     # v18.x or later
npm -v      # v8.x or later
java -v     # v17 or later
```

### Quick Start 🚀

1. **Clone & Install**
```bash
git clone https://github.com/yourusername/ecommerce.git
cd ecommerce-frontend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. **Development**
```bash
npm run dev     # Start development server
npm run build   # Production build
npm run test    # Run tests
```

## 📁 Project Structure

```
ecommerce-frontend/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── (auth)/         # Authentication routes
│   │   ├── (shop)/         # Shopping routes
│   │   └── api/            # API routes
│   ├── components/         
│   │   ├── ui/             # Reusable UI components
│   │   └── forms/          # Form components
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── tests/                 # Test suites
```

## 🔧 Configuration

<details>
<summary>Available Environment Variables</summary>

```env
# API Configuration
NEXT_PUBLIC_API_URL=${BASE_URL}
API_TIMEOUT=5000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATA${BASE_URL}=postgresql://user:password@localhost:5432/db

# Feature Flags
ENABLE_PREMIUM_FEATURES=true
MAINTENANCE_MODE=false
```
</details>

## 📈 Performance Metrics

- **Lighthouse Scores**
  - Performance: 95/100
  - Accessibility: 98/100
  - Best Practices: 100/100
  - SEO: 100/100

## 🤝 Contributing

We love contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

<details>
<summary>Development Guidelines</summary>

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
</details>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💪 Support

- 📧 Email: support@hotshop.com
- 💬 Discord: [Join our server](https://discord.gg/hotshop)
- 📚 Documentation: [docs.hotshop.com](https://docs.hotshop.com)

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/)
- [Vercel](https://vercel.com/)
- [All Contributors](CONTRIBUTORS.md)

---

<div align="center">
  Made with ❤️ by the HoT🔥sHoP team
  <br/>
  <a href="https://twitter.com/hotshop">Twitter</a> • 
  <a href="https://linkedin.com/company/hotshop">LinkedIn</a> • 
  <a href="https://instagram.com/hotshop">Instagram</a>
</div>
