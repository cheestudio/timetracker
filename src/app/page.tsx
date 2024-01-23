"use client";
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { signInWithGoogle } from '@/lib/utils';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/UserContext';
import Image from 'next/image';
import logo from '@/app/assets/logo.svg';

export default function Home() {

  const {user, loggedIn} = useUser();
  const router = useRouter();

  if (loggedIn) {
    router.push('/timesheets/?client=0');
  }
  
  // const [clients, setClients] = useState([] as any);
  // const showClients = async () => {
  //   const clients = await listClients();
  //   setClients(clients);
  // }

  // const createClient = async (e: any) => {
  //   e.preventDefault();
  //   const { data: clientData, error: clientError } = await supabase
  //     .from('Clients')
  //     .insert([{ client_name: e.target[0].value }])
  //     .select('id')
  //     ;

  //   if (clientError) {
  //     console.error('Error creating client: ', clientError);
  //     return;
  //   }

  //   const clientId = clientData[0].id;
  //   const { error: tableInstanceError } = await supabase
  //     .from('TableInstances')
  //     .insert([{ client_id: clientId }]);

  //   if (tableInstanceError) {
  //     console.error('Error creating table instance: ', tableInstanceError);
  //   }
  //   toast.success('Client created successfully!');
  //   router.push(`/timesheets/?client=${clientId}`);
  // }


  return (
    <main className="px-12 text-center">
      {!loggedIn &&
        <>
          <div className="mb-5">
          <Image className="mx-auto my-5" src={logo} alt="logo" width={50} height={50} />
            <Button color="primary" onPress={() => signInWithGoogle()}>
              Sign In
            </Button>
          </div>
        </>
      }
    </main>
  )
}
