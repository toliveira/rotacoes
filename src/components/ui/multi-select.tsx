"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"

import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, value = [], onChange, placeholder = "Select items...", className }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(value.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    setInputValue("")
    if (value.includes(item)) {
        handleUnselect(item)
    } else {
        onChange([...value, item])
    }
  }

  const selectables = options.filter((option) => !value.includes(option.value))

  return (
    <Command onKeyDown={(e) => {
      if (e.key === "Backspace" && !inputValue) {
        e.preventDefault()
        if (value.length > 0) {
           handleUnselect(value[value.length - 1])
        }
      }
      if (e.key === "Escape") {
        inputRef.current?.blur()
      }
    }} className="overflow-visible bg-transparent">
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap">
          {value.map((item) => {
            const option = options.find((o) => o.value === item)
            return (
              <Badge key={item} variant="secondary">
                {option?.label ?? item}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto max-h-60">
                {selectables.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      setInputValue("")
                      onChange([...value, option.value])
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
