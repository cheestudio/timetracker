import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "./utils";
import { useRouter } from "next/navigation";
import { UserContextType } from "./types";

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({} as any);
  const router = useRouter();
  let isLocalhost = false;


  async function checkUser() {
    const { data, error } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
      setLoggedIn(true);
    }
  }

  if (typeof window !== 'undefined') {
    isLocalhost = window.location.hostname.includes("localhost");
  }

  useEffect(() => {
    checkUser();
    if (!loggedIn && !isLocalhost) {
      router.push('/');
    }
    console.log('loggedIn', loggedIn);
  }, [loggedIn, router, isLocalhost]);


  const value = {
    user,
    loggedIn
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )

}