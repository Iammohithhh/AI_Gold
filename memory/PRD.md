# Heritage Gold - AI-Assisted Jewellery Discovery Platform

## Overview
AI-assisted custom jewellery discovery & order-intent platform for traditional goldsmiths. Digitizes trust, discovery, price transparency, and communication.

## Original Problem Statement
Build a platform that is NOT just "a jewellery website" but an AI-assisted custom jewellery discovery & order-intent platform for traditional goldsmiths.

## User Personas
1. **Wedding Shoppers** - Budget 2-10 lakhs, need guidance on traditional designs
2. **Daily Wear Buyers** - Looking for simple, affordable pieces
3. **Festival/Gift Buyers** - Medium budget, occasion-specific
4. **Traditional Jewellery Enthusiasts** - Value craftsmanship and heritage

## Core Requirements (Static)
- Module A: Goldsmith Profile (Trust Layer)
- Module B: Live Gold & Silver Pricing Engine
- Module C: Structured Jewellery Catalogue
- Module D: Transparent Pricing Logic
- Module E: AI Assistant for Recommendations
- Module F: Order Intent (not checkout)
- Module G: Education Section (Know Your Gold)

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Emergent LLM Key (OpenAI GPT)
- **Notifications**: Telegram Bot, Email (Resend)
- **Images**: Cloudinary (when configured)

## What's Been Implemented (Feb 1, 2026)

### Backend APIs ✅
- `/api/health` - Health check
- `/api/gold-price` - Live gold/silver prices (with fallback)
- `/api/goldsmith` - Goldsmith profile CRUD
- `/api/jewellery` - Catalogue with filters
- `/api/jewellery/{id}` - Product detail
- `/api/calculate-price` - Transparent price breakdown
- `/api/chat` - AI assistant with Emergent LLM
- `/api/order-intent` - Save order intent + notifications
- `/api/contact` - Contact form + notifications
- `/api/education` - Educational content
- `/api/cloudinary/signature` - Image upload signing

### Frontend Pages ✅
- Home Page with hero, trust indicators, featured products
- Collection/Catalogue with filters and search
- Product Detail with price calculator
- Cart/Order Intent with submission form
- About/Goldsmith Profile
- Know Your Gold (Education)
- Contact Page
- AI Chat Widget (floating)
- Live Gold Price Ticker

### Features ✅
- Real-time price calculation with transparent breakdown
- AI-powered jewellery recommendations
- Add to cart/selection functionality
- Order intent submission
- Telegram notifications (when configured)
- Email notifications (when configured)
- Mobile responsive design
- Modern luxury UI (Playfair Display + Manrope fonts)

## Prioritized Backlog

### P0 (Critical)
- [x] Core platform functionality
- [x] AI Chat integration
- [x] Price calculator
- [x] Order intent flow

### P1 (High Priority)
- [ ] Configure Telegram Chat ID for notifications
- [ ] Configure Resend API key for email notifications
- [ ] Configure Cloudinary for image uploads
- [ ] Add live gold price API key

### P2 (Medium Priority)
- [ ] Admin dashboard for managing products
- [ ] Customer authentication (optional)
- [ ] Order tracking system
- [ ] WhatsApp integration

### P3 (Low Priority)
- [ ] Customer reviews/testimonials
- [ ] Wishlist functionality
- [ ] Price alerts
- [ ] Multi-language support

## Configuration Required
```env
# Backend (.env)
TELEGRAM_CHAT_ID=your_chat_id  # Get by messaging /start to @userinfobot
RESEND_API_KEY=re_xxx          # Get from resend.com
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
GROQ_API_KEY=xxx               # Optional fallback for AI
```

## Pricing Formula
```
Final Price = (Gold Rate × Weight × Purity Factor) + Labour Cost + 3% GST

Example (22K, 10g, ₹800/g labour):
- Gold: ₹6,875 × 10 = ₹68,750
- Labour: ₹800 × 10 = ₹8,000
- Subtotal: ₹76,750
- GST (3%): ₹2,303
- Total: ₹79,053
```

## Next Steps
1. Configure notification credentials (Telegram Chat ID, Resend API)
2. Add more jewellery items to catalogue
3. Upload real product images via Cloudinary
4. Test full order flow with real notifications
