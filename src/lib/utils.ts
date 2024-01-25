import moment from 'moment-timezone';

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
      redirectTo: "https://chee-time-tracker.vercel.app/timesheets?client=0"
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

export const convertToDecimalHours = (seconds: number) => {
  const hours = seconds / 3600;
  return `${hours.toFixed(2)} hours`;
};


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
  return [today, end];
};

export const getYesterdayRange = () => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const start = moment.tz(userTimeZone).subtract(1, 'days').startOf('day').toDate();
  const end = moment.tz(userTimeZone).subtract(1, 'days').endOf('day').toDate();
  return [start, end];
};

export const getWeekRange = (lastWeek = false) => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const offset = lastWeek ? -7 : 0;

  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek + offset);
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
  return [firstDay, lastDay];
};

export const getLastTwoWeeks = () => {
  const today = new Date();
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  const start = new Date(today);
  start.setDate(today.getDate() - 13);
  start.setHours(0, 0, 0, 0);
  return [start, end];
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
  return new Date(utc).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/* ShadCN
========================================================= */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function debounceWithValue<T extends (...args: any[]) => any>(func: T, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
