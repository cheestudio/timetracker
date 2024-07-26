"use client"

import { useState } from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { DateRange } from "react-day-picker";
import { CustomDateRangeProps } from "@/types/types";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({ handleCustomDateRange }: CustomDateRangeProps) {

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    const updatedDate = newDate;
    setDate(updatedDate);
    handleCustomDateRange(updatedDate);
  }

  const handleDayClick = (day: Date) => {
    setDate((prev) => {
      if (prev?.to) {
        return { from: day, to: undefined };
      }
      if (prev?.from) {
        return { from: prev.from, to: day };
      }
      return { from: day, to: undefined };
    });
  };

  const handleSingleDate = () => {
    if(date?.to == undefined) {
      setDate({ from: date?.from, to: date?.from });
      handleCustomDateRange({ from: date?.from, to: date?.from });
    }
  }

  return (
    <Popover
     onOpenChange={handleSingleDate}
    >
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"secondary"}
          className={cn(
            "w-full justify-center text-center font-normal mt-6",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          className="bg-black"
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(newDate) => handleDateChange(newDate)}
          numberOfMonths={2}
          onDayClick={handleDayClick}
        />
      </PopoverContent>
    </Popover>
  )
}