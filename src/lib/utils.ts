import moment, { Moment } from 'moment-timezone';
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

export const convertTime = (seconds: number | undefined) => {
  if (seconds === undefined || seconds === 0) {
    return '0h 00m';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export const convertToDecimalHours = (seconds: number) => {
  const hours = seconds / 3600;
  return `${hours.toFixed(2)} hours`;
};

export const convertDecimalTime = (decimalTime: number) => {
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

export const getTodayRange = (userTimeZone: string) => {
  const start = moment.tz(userTimeZone).startOf('day').toDate();
  const end = moment.tz(userTimeZone).endOf('day').toDate();
  return [start, end];
};

export const getYesterdayRange = (userTimeZone: string) => {
  const start = moment.tz(userTimeZone).subtract(1, 'days').startOf('day').toDate();
  const end = moment.tz(userTimeZone).subtract(1, 'days').endOf('day').toDate();
  return [start, end];
};

export const getWeekRange = (lastWeek = false) => {
  const today = moment();
  const dayOfWeek = today.day();
  const offset = lastWeek ? -7 : 0;
  const start = today.clone().subtract(dayOfWeek, 'days').add(offset, 'days').startOf('day');
  const end = start.clone().add(6, 'days').endOf('day');
  return [start.toDate(), end.toDate()];
};

export const getThisMonthRange = () => {
  const start = moment().startOf('month');
  const end = moment().endOf('month');
  return [start.toDate(), end.toDate()];
};

export const getLastMonthRange = () => {
  const start = moment().subtract(1, 'month').startOf('month');
  const end = moment().subtract(1, 'month').endOf('month');
  return [start.toDate(), end.toDate()];
};

export const getLastTwoWeeks = () => {
  const end = moment().endOf('day');
  const start = moment().subtract(13, 'days').startOf('day');
  return [start.toDate(), end.toDate()];
};

export const getThisYearRange = () => {
  const start = moment().startOf('year').toDate();
  const end = moment().endOf('year').toDate();
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
  const filteredData = data.filter((client: any) => client.id !== 4); // remove RT
  return filteredData;
}

/* Client Submit Lookup
========================================================= */

export const selectedClient = async (clientId: string | number) => {
  const { data: clientData, error: clientError } = await supabase
    .from('Clients')
    .select('client_name')
    .eq('id', clientId)
    .single();

  if (clientError) {
    console.error('Error fetching client name:', clientError);
    return;
  }
  return clientData.client_name;
}

/* UTC string to Local
========================================================= */
export const UTCtoLocal = (utc: string | Moment, timezone: string) => {
  if (utc !== undefined) {
    return moment.tz(utc, timezone ? timezone : userTimeZone).format('h:mm A');
  }
  return '';
}


export const setTimezone = (owner: string | undefined) => {
  if (owner === 'Lars') {
    return 'America/New_York';
  }
  return 'America/Los_Angeles';
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
  // Remove all non-digit characters except decimal point
  const cleanInput = String(input).replace(/[^0-9.hm]/g, '');

  let hours = 0;
  let minutes = 0;

  // Handle decimal input (e.g., "3.5" -> "3:30")
  if (cleanInput.includes('.')) {
    const [wholeHours, fraction] = cleanInput.split('.');
    hours = parseInt(wholeHours, 10);
    minutes = Math.round(parseFloat(`0.${fraction}`) * 60);
  }
  // format time if hours/minutes are entered (e.g. 3h 30m)
  else if (cleanInput.includes('m') || cleanInput.includes('h')) {
    const timeString = cleanInput.match(/\d+[hm]/g) || [];
    timeString.forEach(time => {
      console.log(time);
      const value = parseInt(time, 10);
      if (time.endsWith('h')) {
        hours += value;
      } else if (time.endsWith('m')) {
        minutes += value;
      }
    });
  }
  // Handle two digits or less (e.g., "90" -> "1:30", "5" -> "5:00")
  else if (cleanInput.length <= 2) {
    const num = parseInt(cleanInput, 10);
    if (num <= 16) {
      hours = num;
    } else {
      hours = Math.floor(num / 60);
      minutes = num % 60;
    }
  }
  // Handle more than two digits (treat as HHMM format)
  else {
    hours = parseInt(cleanInput.slice(0, -2), 10);
    minutes = parseInt(cleanInput.slice(-2), 10);
  }

  // Format output with padding
  const formattedHours = hours.toString().padStart(1, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:00`;
};

/* ShadCN
========================================================= */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createSearchParamsBailoutProxy } from 'next/dist/client/components/searchparams-bailout-proxy';

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
