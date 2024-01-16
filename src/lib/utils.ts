/* Supabase
========================================================= */
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://uqbrkqqnbhbfjbrkagiv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey as string || '');

/* Auth
========================================================= */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: "https://chee-time-tracker.vercel.app"
    }
  })
}

// promise delay function
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


/*  Time Functions
========================================================= */


export const convertTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(part => parseInt(part, 10));
  const date = new Date(year, month - 1, day);
  const formattedMonth = String(date.getMonth() + 1);
  const formattedDay = String(date.getDate());
  const formattedYear = date.getFullYear();
  return `${formattedMonth}/${formattedDay}/${formattedYear}`;
}

export const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  console.log('today', today, end);
  return [today, end];
};

export const getThisWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return [start, end];
};

export const getThisMonthRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  console.log('month', firstDay, lastDay);
  return [firstDay, lastDay];
};

export const listClients = async () => {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    cache: 'no-store'
  });
  const data = await response.json();
  return data;
}

//utc to local
export const UTCtoLocal = (utc:string) => {
  return new Date(utc).toLocaleTimeString();
}