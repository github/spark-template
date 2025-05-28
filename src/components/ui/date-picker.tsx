'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function DatePicker({
  trigger,
  date,
  onChange,
  ...props
}: {
  trigger?: React.ReactElement
  date?: Date
  onChange: (date: Date) => void
} & React.ComponentProps<typeof Calendar>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button
            variant={'outline'}
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatter.format(date) : <span>Pick a date</span>}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}
