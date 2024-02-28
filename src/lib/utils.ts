import moment from 'moment-timezone';
import { createClient } from '@supabase/supabase-js';

/* Supabase
========================================================= */
const supabaseUrl = 'https://uqbrkqqnbhbfjbrkagiv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey as string || '');

/* Auth
========================================================= */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
}

// promise delay function
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /* User Timezone
  ========================================================= */
  export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  export const today = moment().tz(userTimeZone).format('YYYY-MM-DD');

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

export const convertDecimalTime = (decimalTime:number) => {
  var hours = Math.floor(decimalTime);
  var minutes = Math.round((decimalTime - hours) * 60);
  return hours + ":" + (minutes < 10 ? '0' : '') + minutes;
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
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const start = moment.tz(userTimeZone).startOf('day').toDate();
  const end = moment.tz(userTimeZone).endOf('day').toDate();
  return [start, end];
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

export const getLastMonthRange = () => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
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

/* Client Fetch
========================================================= */
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

/* UTC string to Local
========================================================= */
export const UTCtoLocal = (utc:string) => {
  return new Date(utc).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/* Convert Time Input to UTC
  ========================================================= */
  export const formatTime = (time: string) => {
    const regexPattern = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?$/;
    const militaryTimePattern = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    const decimalTimePattern = /^(\d{1,2})(\d{2})(am|pm|AM|PM)?$/;
    let match = time.match(regexPattern);
    let formattedTime;

    if (match) { // match any time pattern
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? match[2] : '00';
      const ampm = match[3] ? match[3].toUpperCase() : (hours < 12 ? 'AM' : 'PM');
      if (hours === 12) {
        hours = ampm === 'AM' ? 0 : 12;
      } else if (ampm === 'PM') {
        hours += 12;
      }
      formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
    } 
    else { // match military time, e.g. 1430 -> 2:30
      match = time.match(militaryTimePattern);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
      } 
      else { //match decimal time, e.g. 230 -> 2:30
        match = time.match(decimalTimePattern);
        if (match) {
          let hours = parseInt(match[1], 10);
          let minutes = match[2];
          let ampm = match[3] ? match[3].toUpperCase() : (hours < 12 ? 'AM' : 'PM');
          formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
        }
      }
    }
    return formattedTime;
  };
  
  /* Time to Seconds
  ========================================================= */
  export const timeToSeconds = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  }

  export const timeToUTC = (time: string) => {
    const currentDate = moment().format('YYYY-MM-DD');
    const formattedTime = formatTime(time);
    const localTime = moment.tz(`${currentDate} ${formattedTime}`, 'YYYY-MM-DD h:mm A', userTimeZone);
    return localTime;
  };

  export const formatTimeInput = (time: string) => {
    const formattedTime = formatTime(time);
    return formattedTime;
  };

  /* Time Difference
  ========================================================= */
  export const calculateElapsedTime = (startTime: string | undefined, endTime: string | undefined) => {

    if (startTime === '0:00:00' || endTime === '0:00:00') {
      return '0:00';
    }

    const format = 'h:mm A';
    const startMoment = moment(startTime, format);
    const endMoment = moment(endTime, format);

    if (endMoment.isBefore(startMoment)) {
      endMoment.add(1, 'day');
    }

    const duration = moment.duration(endMoment.diff(startMoment));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return '0:00';
    }

    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };

  
  /* Timer Input
  ========================================================= */

  export const timerInputFormat = (input: string) => {
    const cleanInput = String(input).replace(/\D/g, '').replace(/^0+/, '');
    let
      hours: string | number = '0',
      minutes: string | number = '0',
      seconds: string | number = '00';

    if (cleanInput.length === 1 || cleanInput.length === 2) {
      minutes = cleanInput.padStart(2, '0');

      const totalMinutes = parseInt(cleanInput, 10);

      if (totalMinutes >= 0 && totalMinutes <= 99) {
        hours = Math.floor(totalMinutes / 60);
        minutes = totalMinutes % 60;
        minutes = minutes.toString().padStart(2, '0');
      }

    } else if (cleanInput.length === 3) {
      hours = cleanInput.substring(0, 1);
      minutes = cleanInput.substring(1, 3);
    } else if (cleanInput.length === 4) {
      hours = cleanInput.substring(0, 2);
      minutes = cleanInput.substring(2, 4);
    } else {
      hours = cleanInput.substring(0, cleanInput.length - 4);
      minutes = cleanInput.substring(cleanInput.length - 4, cleanInput.length - 2);
      seconds = cleanInput.substring(cleanInput.length - 2);
    }
    return `${hours}:${minutes}:${seconds}`;
  };

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
