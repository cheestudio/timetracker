"use client";
import { useEffect } from "react";
export const dynamic = "force-dynamic";
import { signInWithGoogle } from "@/lib/utils";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import logo from "@/app/assets/logo.svg";

export default function Home() {
  const { loggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn) {
      router.push("/submit/");
    }
  }, [loggedIn, router]);

  return (
    <main className="px-12 text-center">
      {!loggedIn && (
        <>
          <div className="mb-5">
            <Image
              className="mx-auto my-5"
              src={logo}
              alt="logo"
              width={50}
              height={50}
            />
            <Button color="primary" onPress={() => signInWithGoogle()}>
              Sign In
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
