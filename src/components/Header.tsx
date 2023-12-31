"use client";

import Image from 'next/image';
import { Button } from '@nextui-org/react';
import logo from '@/app/assets/logo.svg';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex items-center justify-center mb-10">
      <Link href="/">
      <Image src={logo} alt="logo" width={50} height={50} />
      </Link>
      {pathname === '/timesheets' &&
        <div className="ml-auto">
          <Button variant="flat" onPress={() => router.push("/")}>Back Home</Button>
        </div>
      }
    </div>
  )
}

export default Header;