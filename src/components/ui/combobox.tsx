"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
  options: { value: string; label: string }[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  className?: string
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  maxItemsToRender?: number
  largeListThreshold?: number
  minSearchChars?: number
  truncateLabel?: boolean
  maxSelections?: number
}

export function Combobox({
  options,
  value,
  onChange,
  className,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  noResultsText = "No option found.",
  maxItemsToRender = 150,
  largeListThreshold = 500,
  minSearchChars = 2,
  maxSelections,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [search])

  const needsSearchGate = options.length >= largeListThreshold && search.length < minSearchChars
  const filtered = React.useMemo(() => {
    if (needsSearchGate) return []
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, search, needsSearchGate])

  const limited = React.useMemo(() => filtered.slice(0, maxItemsToRender), [
    filtered,
    maxItemsToRender,
  ])

  const valueAsArray = Array.isArray(value) ? value : value ? [value] : []
  const selectedLabels = valueAsArray
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)
    .join(", ")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          <span className="truncate">{valueAsArray.length > 0 ? selectedLabels : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: "var(--radix-popover-trigger-width)" }} className="p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} onValueChange={setSearch} />
          <CommandList ref={listRef}>
            <CommandEmpty>
              {needsSearchGate
                ? `Type at least ${minSearchChars} characters to search ${options.length} options...`
                : noResultsText}
            </CommandEmpty>
            <CommandGroup>
              {limited.map((option) => {
                const isSelected = valueAsArray.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      if (maxSelections === 1) {
                        onChange(isSelected ? "" : option.value)
                        setOpen(false)
                        return
                      }

                      if (maxSelections && !isSelected && valueAsArray.length >= maxSelections) {
                        return
                      }

                      const newValue = isSelected
                        ? valueAsArray.filter((v) => v !== option.value)
                        : [...valueAsArray, option.value]
                      onChange(newValue)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}