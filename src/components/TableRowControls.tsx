import { Input, Select, SelectItem } from "@nextui-org/react";
import { TableRowControlsProps } from "@/lib/types";
import { listClients } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTimesheet } from "@/lib/TimesheetContext";
import {Calendar} from '@react-spectrum/calendar';

const TableRowControls = ({ viewableRows, selectedDateRange, handleUser, selectedUser, handleViewableRows, handleDateRange }: TableRowControlsProps) => {

  const { currentClient, setCurrentClient } = useTimesheet();
  const [clients, setClients] = useState([]);

  const handleClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentClient(e.target.value);
  }

  const getClients = async () => {
    const clients = await listClients();
    setClients(clients);
  };

  useEffect(() => {
    getClients();
  }, []);

  return (
    <>
      <div className="flex justify-end gap-5 table-row-controls">
        <div className="flex-[0_0_300px] mr-auto ml-0">
          <Select
            value={currentClient}
            onChange={handleClient}
            selectedKeys={currentClient}
            onOpenChange={(e) => console.log(e)}
            variant="bordered"
            label="Client"
            labelPlacement="outside"
            placeholder="Select"
            disallowEmptySelection={false}
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key={0}>All</SelectItem>
            {
              clients.map((client: any) => (
                <SelectItem key={client.id}>{client.client_name}</SelectItem>
              ))
            }
          </Select>
        </div>

        <div className="flex-[0_0_200px]">
          <Select
            value={selectedUser}
            onChange={handleUser}
            variant="bordered"
            label="Owner"
            labelPlacement="outside"
            placeholder="Select"
            disallowEmptySelection={true}
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key="">All</SelectItem>
            <SelectItem key="Lars">Lars</SelectItem>
            <SelectItem key="Matt">Matt</SelectItem>
          </Select>
        </div>

        <div className="flex-[0_0_200px]">
          <Select
            value={viewableRows}
            onChange={handleViewableRows}
            variant="bordered"
            label="Viewable Rows"
            labelPlacement="outside"
            placeholder="Select"
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key="-1">All</SelectItem>
            <SelectItem key="1">25</SelectItem>
            <SelectItem key="5">50</SelectItem>
            <SelectItem key="75">75</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </div>
        <div className="flex-[0_0_200px]">
          <Select
            value={selectedDateRange}
            onChange={handleDateRange}
            variant="bordered"
            label="Date Range"
            labelPlacement="outside"
            placeholder="Select"
            popoverProps={{
              classNames: {
                content: "bg-[#27272A]",
              },
            }}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="this_week">This Week</SelectItem>
            <SelectItem key="this_month">This Month</SelectItem>
          </Select>
        </div>
      </div>
    </>
  );
};

export default TableRowControls;
