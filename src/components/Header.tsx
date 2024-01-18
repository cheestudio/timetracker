"use client";

import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import Image from 'next/image';
import logo from '@/app/assets/logo.svg';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/utils';
import { useTimesheet } from '@/lib/TimesheetContext';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentClient } = useTimesheet();
  const [title, setTitle] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('Clients')
        .select('*')
        .eq('id', currentClient)
        ;
      if (isMounted) {
        if (error) {
          console.error('Error fetching data: ', error);
        } else if (data) {
          const clientName = data.length > 0 ? data[0]?.client_name : 'All';
          setTitle(clientName);
        }
      }
    })();
  }, [currentClient]);

  return (
    <div className="flex items-center justify-center mb-10">
      <Link href="/">
        <Image src={logo} alt="logo" width={50} height={50} />
      </Link>
      {pathname === '/timesheets' &&
        <div className="ml-auto">
          <h3>{title}</h3>
        </div>
      }
      {pathname === '/timesheets' &&
        <div className="ml-auto">
          <Button variant="flat" onPress={() => router.push("/")}>Back Home</Button>
        </div>
      }
    </div>
  )
}

export default Header;