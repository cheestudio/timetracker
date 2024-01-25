import React, { useRef } from "react";

import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { TableRowControlsProps } from "@/lib/types";
import { listClients } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTimesheet } from "@/lib/TimesheetContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DatePickerWithRange } from "./DatePicker";
import ClientDropdown from "./ClientDropdown";

const TableRowControls = ({ timeEntries, viewableRows, selectedDateRange, handleCustomDateRange, handleUser, selectedUser, handleViewableRows, handleDateRange, handleSearch, loading }: TableRowControlsProps) => {
  
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  return (
    <>
      <div className="flex justify-end gap-5 pt-24 table-row-controls">
        <div className="flex-[1_1_auto] mr-auto ml-0">
          <ClientDropdown />
        </div>
        <div className="flex-[1_1_auto]">
          <Select
            radius="sm"
            value={selectedUser}
            onChange={handleUser}
            variant="bordered"
            label="Owner"
            labelPlacement="outside"
            placeholder="Select"
            disallowEmptySelection={true}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="Lars">Lars</SelectItem>
            <SelectItem key="Matt">Matt</SelectItem>
          </Select>
        </div>
        <div className="flex-[1_1_auto]">
          <Select
            radius="sm"
            value={viewableRows}
            onChange={handleViewableRows}
            variant="bordered"
            label="Viewable Rows"
            labelPlacement="outside"
            placeholder="Select"
            disallowEmptySelection={true}
          >
            <SelectItem key="500">All</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="75">75</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </div>
        <div className="flex-[1_1_auto]">
          <Select
            radius="sm"
            defaultSelectedKeys={new Set(["this_week"])}
            onChange={handleDateRange}
            disallowEmptySelection={true}
            variant="bordered"
            label="Date Range"
            labelPlacement="outside"
            placeholder="Select"
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="yesterday">Yesterday</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="this_week">This Week</SelectItem>
            <SelectItem key="last_week">Last Week</SelectItem>
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

        <div className="flex-[0_1_50px] self-end">
          <Button isLoading={loading} variant="light" isIconOnly onPress={() => setShowSearch(!showSearch)}>
            <MagnifyingGlassIcon className="w-7 h-7" />
          </Button>
        </div>

      </div>
      {showSearch &&
        <div className="flex justify-end gap-5 table-row-controls">
          <div className="flex-[1_1_auto]">
            <Input
              isRequired
              variant="bordered"
              label="Search"
              labelPlacement="outside"
              classNames={{
                input: 'text-lg font-bold text-white',
              }}
              type="text"
              id="timer_time"
              onChange={handleSearch}
              ref={searchInputRef}
            />
          </div>
        </div>
      }
    </>
  );
};

export default TableRowControls;
