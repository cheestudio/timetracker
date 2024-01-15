import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor } from "@nextui-org/react";
import { TimeEntryProps } from "@/lib/types";
import { formatDate, convertTime } from "@/lib/utils";

const TableDisplay = ({ items, sortDescriptor, onSort, handleSelectedKeys }: { items: any, sortDescriptor: SortDescriptor, onSort: any, handleSelectedKeys: any }) => {
  return (
    <Table
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      onSelectionChange={handleSelectedKeys}
      onSortChange={onSort}
    >
      <TableHeader>
        <TableColumn key="date" allowsSorting>Date</TableColumn>
        <TableColumn key="task" allowsSorting>Task</TableColumn>
        <TableColumn key="time_tracked" allowsSorting>Time</TableColumn>
        <TableColumn key="owner" allowsSorting>Owner</TableColumn>
      </TableHeader>
      <TableBody>
        {items.map((row: TimeEntryProps) => (
          <TableRow key={row.entry_id}>
            <TableCell>{formatDate(row.date)}</TableCell>
            <TableCell>{row.task}</TableCell>
            <TableCell>{convertTime(parseInt(row.time_tracked))}</TableCell>
            <TableCell>{row.owner}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableDisplay;