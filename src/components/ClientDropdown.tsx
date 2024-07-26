import { useEffect, useState } from 'react';
import { listClients } from "@/lib/utils";
import { Select, SelectItem } from '@nextui-org/react';

export function ClientDropdown({client, handleClient}: any) {

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
      name="client_id"
      onChange={handleClient}
      defaultSelectedKeys={client}
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