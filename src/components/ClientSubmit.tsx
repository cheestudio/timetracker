import React, { useEffect, useState } from 'react';
import { useTimesheet } from '@/lib/TimesheetContext';
import { listClients } from "@/lib/utils";
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

function ClientSubmit({client, handleClient}: any) {

  const [clients, setClients] = useState([]);

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
      value={client}
      onChange={handleClient}
      selectedKeys={client}
      variant="bordered"
      label="Client"
      labelPlacement="outside"
      placeholder="Select"
      disallowEmptySelection={false}
    >
      {
        clients.map((client: any) => (
          <SelectItem key={client.id}>{client.client_name}</SelectItem>
        ))
      }
    </Select>
  );
}

export default ClientSubmit;
