# 7️⃣ AI-Powered Stock Market & Crypto Analyst 📈

An intelligent Vue 3 application that provides AI-driven insights for stocks and cryptocurrency investments using Mistral AI.

## 🔹 What It Does?

- Users ask about stocks or crypto, and AI provides data-driven insights
- AI analyzes market trends and predicts potential risks
- Explains complex financial terms in simple, understandable language
- Provides personalized investment recommendations

## 🔹 Unique Features

- Smart Investment Advisor: "Should I buy this stock?" → AI gives data-driven answers
- Pattern Recognition: AI detects market patterns and sends timely alerts
- Risk Analysis: Personalized investment strategy based on user's risk tolerance
- Real-time Updates: Get instant insights about market movements

### Examples
👉 "Bitcoin is down 5% today. Should you buy the dip?"
👉 "Apple's stock is trending due to a new product launch!"

## Tech Stack

- Frontend: Vue.js 3 (Composition API)
- Backend & Auth: Supabase
- AI Analysis: Mistral AI
- Market Data: Financial Market API
- Build Tool: Vite

## Setup

### Prerequisites

- Node.js and npm installed
- Supabase account
- Mistral API key
- Market Data API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-stock-market
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file with:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MISTRAL_API_KEY=your-mistral-api-key
VITE_MARKET_API_KEY=your-market-api-key
```

4. Set up Supabase database:

```sql
-- Create portfolio table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Create access policies
CREATE POLICY "Users can view their own portfolio" 
  ON public.portfolios FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their portfolio" 
  ON public.portfolios FOR ALL 
  USING (auth.uid() = user_id);
```

5. Start development server:
```bash
npm run dev
```

## Usage

1. Create an account or login
2. Ask AI about market trends and specific stocks/crypto
3. Set up your portfolio and risk preferences
4. Receive AI-powered insights and alerts

## Features Coming Soon

- Portfolio performance tracking
- Custom alert settings
- Advanced technical analysis
- Market sentiment analysis
- Multi-currency support
