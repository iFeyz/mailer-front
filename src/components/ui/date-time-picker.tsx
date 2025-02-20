"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | null>(null)
  const [timeInput, setTimeInput] = React.useState("00:00")
  const [open, setOpen] = React.useState(false)

  // Initialisation et mise à jour depuis la prop value
  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTimeInput(format(value, "HH:mm"))
    }
  }, [value])

  // Mise à jour du parent uniquement quand la date ou l'heure change
  const handleDateChange = React.useCallback((newDate: Date | null) => {
    if (!newDate) {
      setDate(null)
      onChange?.(null)
      return
    }

    const [hours, minutes] = timeInput.split(":").map(Number)
    const updatedDate = new Date(newDate)
    updatedDate.setHours(hours)
    updatedDate.setMinutes(minutes)
    
    setDate(updatedDate)
    onChange?.(updatedDate)
  }, [timeInput, onChange])

  const handleTimeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeInput = e.target.value
    setTimeInput(newTimeInput)

    if (date) {
      const [hours, minutes] = newTimeInput.split(":").map(Number)
      const updatedDate = new Date(date)
      updatedDate.setHours(hours)
      updatedDate.setMinutes(minutes)
      onChange?.(updatedDate)
    }
  }, [date, onChange])

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timeInput}
        onChange={handleTimeChange}
        className="w-[120px]"
      />
    </div>
  )
} 