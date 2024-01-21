import React, { useEffect, useState } from 'react';
import { useTimesheet } from '@/lib/TimesheetContext';
import { listClients } from "@/lib/utils";
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

function ClientDropdown({ isSubmit }: { isSubmit?: boolean }) {

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
          // @ts-ignore
          !isSubmit && <SelectItem key={0}>All</SelectItem>,
          ...clients.map((client: any) => (
            <SelectItem key={client.id}>{client.client_name}</SelectItem>
          ))
        ]
      }
    </Select>
  );
}

export default ClientDropdown;
