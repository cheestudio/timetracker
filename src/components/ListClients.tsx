import { Button, Link } from '@nextui-org/react';

const ListClients = ({ clients }: { clients: any }) => {
  return (
    <div className="grid grid-cols-3 gap-x-10 gap-y-5">
      {clients.map((client: any) => (
        <div className="mb-5" key={client.client_name}>
          <Button className="w-full" variant="flat" color="primary" as={Link} href={`/timesheets/?client=${client.id}`}>{client.client_name}</Button>
        </div>
      ))}
    </div>
  )
}

export default ListClients;