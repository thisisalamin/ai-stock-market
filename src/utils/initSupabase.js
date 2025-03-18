import { supabase } from '../supabase';

export const SQL_SETUP_INSTRUCTIONS = `
-- Create market_analyses table
create table public.market_analyses (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    type text check (type in ('stock', 'crypto')) not null,
    symbol text not null,
    context text,
    analysis text not null
);

-- Set up Row Level Security (RLS)
alter table public.market_analyses enable row level security;

-- Create policies
create policy "Users can view their own analyses"
    on market_analyses for select
    using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
    on market_analyses for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own analyses"
    on market_analyses for delete
    using (auth.uid() = user_id);
`;

export const initializeDatabase = async () => {
  try {
    // Check if market_analyses table exists
    const { error } = await supabase
      .from('market_analyses')
      .select('id')
      .limit(1);

    return !error;
  } catch (err) {
    console.error('Database initialization check failed:', err);
    return false;
  }
};
