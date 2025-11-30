import { supabase } from '@/lib/supabase'

// Returns a new quote every day based on day number, rotating through all in DB
export async function getTodaysQuote() {
  const { data, error } = await supabase
    .from('daily_quotes')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const today = new Date();
  const dayNumber = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  const quote = data[dayNumber % data.length];

  return quote;
}
