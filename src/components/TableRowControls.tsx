import React, { useRef } from "react";

import { Button, Input, Select, SelectItem, Tooltip } from "@nextui-org/react";
import { TableRowControlsProps } from "@/lib/types";
import { useEffect, useState } from "react";
import { ChartBarSquareIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DatePickerWithRange } from "./DatePicker";
import ClientSelector from "./ClientSelector";
import useVisibility from "@/lib/useVisibility";
import ToggleElement from "./ToggleElement";

const TableRowControls = ({ timeEntries, viewableRows, selectedDateRange, handleCustomDateRange, handleUser, selectedUser, handleViewableRows, handleDateRange, handleSearch, loading, barVisibility, toggleBarVisibility, resetSearch }: TableRowControlsProps) => {

  const { isVisible, toggleVisibility } = useVisibility(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isVisible) {
      resetSearch();
    }
  }, [isVisible,resetSearch]);

  return (
    <div className="top-0 sticky w-full py-3 bg-[#070707]/95 backdrop-blur-md z-50">
      <div className="flex justify-end gap-5 table-row-controls ">
        <div className="flex-[1_1_auto] mr-auto ml-0">
          <ClientSelector />
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
            defaultSelectedKeys={new Set(["1000"])}
            variant="bordered"
            label="Viewable Rows"
            labelPlacement="outside"
            placeholder="Select"
            disallowEmptySelection={true}
          >
            <SelectItem key="1000">All</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="75">75</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </div>
        <div className="flex-[1_1_auto]">
          <Select
            radius="sm"
            defaultSelectedKeys={new Set(["this_month"])}
            onChange={handleDateRange}
            disallowEmptySelection={true}
            variant="bordered"
            label="Date Range"
            labelPlacement="outside"
            placeholder="Select"
          >
            <SelectItem key="yesterday">Yesterday</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="last_week">Last Week</SelectItem>
            <SelectItem key="this_week">This Week</SelectItem>
            <SelectItem key="last_month">Last Month</SelectItem>
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

        <div className="flex-[0_1_40px] self-end text-center">
          <Button isLoading={loading} variant="light" isIconOnly onPress={toggleVisibility}>
            {isVisible ? <XMarkIcon className="w-7 h-7" /> : <MagnifyingGlassIcon className="w-7 h-7" />}
          </Button>
        </div>
        <div className="flex-[0_1_40px] self-end text-center">
          <Button isIconOnly variant="light" onPress={() => toggleBarVisibility()}>
            <Tooltip content={barVisibility ? "Toggle Chart" : "Toggle Chart"}>
              <ChartBarSquareIcon className="w-7 h-7" />
            </Tooltip>
          </Button>
        </div>

      </div>
      <ToggleElement isVisible={isVisible}>
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
      </ToggleElement>

    </div>
  );
};

export default TableRowControls;
