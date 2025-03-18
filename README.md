# Vue Mistral Notes

A Vue 3 application for creating and managing notes with AI-powered summaries using the Mistral API.

## Features

- User authentication with Supabase
- Create, read, and delete notes
- Automatic note summarization using Mistral AI
- Responsive design

## Setup

### Prerequisites

- Node.js and npm installed
- Supabase account (free tier works fine)
- Mistral API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vue-mistral-notes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MISTRAL_API_KEY=your-mistral-api-key
```

4. Set up your Supabase database:
   - Go to your Supabase project's SQL Editor
   - Run the following SQL commands:

```sql
-- Create notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up row-level security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" 
  ON public.notes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.notes 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

5. Run the development server:
```bash
npm run dev
```

## Usage

1. Sign up for an account or log in
2. Create notes using the text area
3. Use the "Summarize" button to get an AI-generated summary
4. Delete notes as needed

## Technologies Used

- Vue 3 (Composition API)
- Vue Router
- Supabase (Authentication & Database)
- Mistral AI API
- Vite (Build tool)
