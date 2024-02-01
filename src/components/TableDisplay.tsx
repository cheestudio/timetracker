import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor, Button } from "@nextui-org/react";
import { TimeEntryProps } from "@/lib/types";
import { formatDate, convertTime, UTCtoLocal } from "@/lib/utils";
import { CheckCircleIcon, ClipboardCopyIcon } from "@heroicons/react/24/outline";
import EditEntry from "./EditEntry";
import toast from 'react-hot-toast';

const TableDisplay = ({ items, sortDescriptor, onSort, handleSelectedKeys }: { items: any, sortDescriptor: SortDescriptor, onSort: any, handleSelectedKeys: any }) => {


  const CopyToClipboard = ({ text }) => {
    console.log(text);
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Table
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      onSelectionChange={handleSelectedKeys}
      onSortChange={onSort}
      classNames={
        {
          td: 'py-0',
        }
      }
    >
      <TableHeader>
        <TableColumn key="task" allowsSorting width="25%">Task</TableColumn>
        <TableColumn key="date" allowsSorting>Date</TableColumn>
        <TableColumn key="start_time" allowsSorting>Time</TableColumn>
        <TableColumn key="time_tracked" allowsSorting>Duration</TableColumn>
        <TableColumn key="owner" allowsSorting>Owner</TableColumn>
        <TableColumn key="billable" allowsSorting>Billable</TableColumn>
        <TableColumn key="client_name" allowsSorting width="10%">Client</TableColumn>
        <TableColumn>&nbsp;</TableColumn>
      </TableHeader>
      <TableBody>
        {items.map((row: TimeEntryProps) => (
          <TableRow key={row.entry_id}>
            <TableCell>
              <Button variant="light" disableRipple className="justify-start p-0 rounded-none !bg-transparent !transform-none" onClick={(e) => {
              navigator.clipboard.writeText(row.task);
              toast.success('Copied to clipboard!');
             }}>
              {row.task}
             </Button>
            </TableCell>
            <TableCell>{formatDate(row.date)}</TableCell>
            <TableCell>
              <div className="text-sm">
                {row.start_time && row.end_time &&
                  <div>
                    <span className="start-time">
                      {UTCtoLocal(row.start_time)}</span> - <span className="end-time">{UTCtoLocal(row.end_time)}</span>
                  </div>
                }
              </div>
            </TableCell>
            <TableCell>
              <div>{convertTime(parseInt(row.time_tracked))}</div>
            </TableCell>
            <TableCell>{row.owner}</TableCell>
            <TableCell>{row.billable && <CheckCircleIcon className="w-5 h-5 text-primary" />}</TableCell>
            <TableCell>{row.client_name}</TableCell>
            <TableCell>
              <EditEntry entryData={row} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableDisplay;