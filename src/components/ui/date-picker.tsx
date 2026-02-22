"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date)
}
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Choisir une date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  function handleSelect(date: Date | undefined) {
    onChange(date ?? null)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto py-1.5 px-2 -ml-2 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
          {value ? (
            <span className="flex-1 text-left text-sm">
              {formatDate(value)}
            </span>
          ) : (
            <span className="flex-1 text-left text-sm">{placeholder}</span>
          )}
          {value && (
            <X
              className="h-3.5 w-3.5 ml-auto flex-shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
