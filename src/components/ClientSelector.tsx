import React, { useEffect, useState } from 'react';
import { useTimesheet } from '@/context/TimesheetContext';
import { listClients } from "@/lib/utils";
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export function ClientSelector({ isSubmit }: { isSubmit?: boolean }) {

  const { currentClient, setCurrentClient } = useTimesheet();
  const [clients, setClients] = useState([]);
  const router = useRouter();

  const handleClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentClient(e.target.value);
    router.push(`/timesheets/?client=${e.target.value}`);
  }

  const getClients = async () => {
    const clients = await listClients();
    setClients(clients);
  };

  useEffect(() => {
    getClients();
  }, []);

  return (

    <Select
      radius="sm"
      value={currentClient}
      onChange={handleClient}
      selectedKeys={currentClient}
      variant="bordered"
      label="Client"
      labelPlacement="outside"
      placeholder="Select"
      disallowEmptySelection={false}
    >
      {
        [
          <SelectItem key={0}>All</SelectItem>,
          ...clients.map((client: any) => (
            <SelectItem key={client.id}>{client.client_name}</SelectItem>
          ))
        ]
      }
    </Select>
  );
}