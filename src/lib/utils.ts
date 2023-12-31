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
          redirectTo: "http://localhost:3000/week/1"
      }
  })
}

// promise delay function
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// /* Shadcn
// ========================================================= */
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }
