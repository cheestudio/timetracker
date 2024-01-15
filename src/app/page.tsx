"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/utils';
import { signInWithGoogle } from '@/lib/utils';
import { Button, Divider, Input, Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation'
import ListClients from '@/components/ListClients';
import toast from 'react-hot-toast';
import { listClients } from '@/lib/utils';

export default function Home() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [clients, setClients] = useState([] as any);
  const router = useRouter();

  const showClients = async () => {
    const clients = await listClients();
    setClients(clients);
  }
  
  async function checkUser() {
    const { data, error } = await supabase.auth.getSession();
    setLoggedIn(data.session !== null);
  }

  useEffect(() => {
    checkUser();
    showClients();
  }, [loggedIn]);

  const createClient = async (e: any) => {
    e.preventDefault();
    const { data: clientData, error: clientError } = await supabase
      .from('Clients')
      .insert([{ client_name: e.target[0].value }])
      .select('id')
      ;

    if (clientError) {
      console.error('Error creating client: ', clientError);
      return;
    }

    const clientId = clientData[0].id;
    const { error: tableInstanceError } = await supabase
      .from('TableInstances')
      .insert([{ client_id: clientId }]);

    if (tableInstanceError) {
      console.error('Error creating table instance: ', tableInstanceError);
    }
    toast.success('Client created successfully!');
    router.push(`/timesheets/?client=${clientId}`);
  }


  return (
    <main className="px-12 text-center">

      {loggedIn ?
        <>
          <h2 className="mb-5 font-semibold">Choose a Client:</h2>

          <ListClients clients={clients} />

          <Divider className="my-10" />

          <div className="max-w-md mx-auto">
            <h3 className="mb-5 font-semibold">Create a New Client:</h3>
            <form onSubmit={createClient}>
              <Input isRequired className="mb-5" variant="bordered" label="Client Name" />
              <Button color="secondary" variant="flat" type="submit">Add Client</Button>
            </form>
          </div>

        </>
        :
        <div className="mb-5">
          <Button color="primary" onPress={() => signInWithGoogle()}>
            Sign In
          </Button>
        </div>
      }
    </main>
  )
}
