import React from "react";

import { Input, Select, SelectItem } from "@nextui-org/react";
import { TableRowControlsProps } from "@/lib/types";
import { listClients } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTimesheet } from "@/lib/TimesheetContext";
import { DatePickerWithRange } from "./DatePicker";
import ClientDropdown from "./ClientDropdown";

const TableRowControls = ({ viewableRows, selectedDateRange, handleCustomDateRange, handleUser, selectedUser, handleViewableRows, handleDateRange }: TableRowControlsProps) => {


  return (
    <>
      <div className="flex justify-end gap-5 table-row-controls">
        <div className="flex-[1_1_auto] mr-auto ml-0">
          <ClientDropdown />
        </div>

        <div className="flex-[1_1_auto]">
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

        <div className="flex-[1_1_auto]">
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
        <div className="flex-[1_1_auto]">
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
            <SelectItem key="custom">Custom</SelectItem>
          </Select>
        </div>

        {selectedDateRange === "custom" &&
          <div className="flex-[1_1_auto]">
            <DatePickerWithRange
              handleCustomDateRange={handleCustomDateRange}
            />
          </div>
        }

      </div>
    </>
  );
};

export default TableRowControls;
