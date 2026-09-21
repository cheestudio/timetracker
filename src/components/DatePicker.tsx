"use client";

import { useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CustomDateRangeProps } from "@/types/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
  handleCustomDateRange,
}: CustomDateRangeProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    const updatedDate = newDate;
    setDateRange(updatedDate);
    handleCustomDateRange(updatedDate);
  };

  const handleSingleDate = () => {
    if (dateRange?.to == undefined) {
      setDateRange({ from: dateRange?.from, to: dateRange?.from });
      handleCustomDateRange({ from: dateRange?.from, to: dateRange?.from });
    }
  };

  return (
    <Popover onOpenChange={handleSingleDate}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"secondary"}
          className={cn(
            "w-full justify-center text-center font-normal mt-6",
            !dateRange && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          className="bg-white"
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(newDate) => handleDateChange(newDate)}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
