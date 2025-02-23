import { useRef } from "react";
import { Button, Input, Select, SelectItem, Tooltip } from "@nextui-org/react";
import { TableRowControlsProps } from "@/types/types";
import { useEffect } from "react";
import { ChartBarSquareIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DatePickerWithRange } from "./DatePicker";
import { ClientSelector } from "./ClientSelector";
import { ToggleElement } from "./ToggleElement";
import useVisibility from "@/hooks/useVisibility";

export function TableRowControls({ ...props }: TableRowControlsProps) {

  const { isVisible, toggleVisibility } = useVisibility(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isVisible) {
      props.resetSearch();
    }
  }, [props, isVisible]);

  return (
    <div className="top-0 md:sticky w-full p-3 bg-[#070707]/95 backdrop-blur-md z-50">
      <div className="flex flex-col justify-end gap-5 table-row-controls md:flex-row">
        <div className="flex-[1_1_auto]">
          <ClientSelector />
        </div>
        <div className="flex-[1_1_auto]">
          <Select
            radius="sm"
            value={props.selectedUser}
            onChange={props.handleUser}
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
            value={props.viewableRows}
            onChange={props.handleViewableRows}
            defaultSelectedKeys={new Set(["100"])}
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
            defaultSelectedKeys={new Set(["today"])}
            onChange={props.handleDateRange}
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
            <SelectItem key="this_year">This Calendar Year</SelectItem>
            <SelectItem key="custom">Custom</SelectItem>
          </Select>
        </div>

        {props.selectedDateRange === "custom" &&
          <div className="flex-[1_1_auto]">
            <DatePickerWithRange
              handleCustomDateRange={props.handleCustomDateRange}
            />
          </div>
        }

        <div className="flex gap-5 place-content-center md:contents">
          <div className="flex-[0_1_40px] self-end text-center">
            <Button isLoading={props.loading} variant="light" isIconOnly onPress={toggleVisibility}>
              {isVisible ? <XMarkIcon className="w-7 h-7" /> : <MagnifyingGlassIcon className="w-7 h-7" />}
            </Button>
          </div>
          <div className="flex-[0_1_40px] self-end text-center">
            <Button isIconOnly variant="light" onPress={() => props.toggleBarVisibility()}>
              <Tooltip content={props.barVisibility ? "Toggle Chart" : "Toggle Chart"}>
                <ChartBarSquareIcon className="w-7 h-7" />
              </Tooltip>
            </Button>
          </div>
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
              onChange={props.handleSearch}
              ref={searchInputRef}
            />
          </div>
        </div>
      </ToggleElement>

    </div>
  );
};