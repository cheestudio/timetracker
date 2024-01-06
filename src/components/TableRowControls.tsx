import { Select, SelectItem } from "@nextui-org/react";
import { TableRowControlsProps } from "@/lib/types";


const TableRowControls = ({ viewableRows, selectedDateRange, handleViewableRows, handleDateRange }: TableRowControlsProps) => {
  
  return (
    <div className="flex justify-end gap-5 table-row-controls">
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
  );
};

export default TableRowControls;
