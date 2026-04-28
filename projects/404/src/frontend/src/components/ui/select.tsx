import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu"

export interface SelectProps {
  options: { label: string; value: string }[]
  value?: string
  onChange?: (e: { target: { value: string, name?: string } }) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  disabled?: boolean
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, value, onChange, placeholder, id, name, disabled }, ref) => {
    const selectedOption = options.find(opt => opt.value === value)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            ref={ref}
            id={id}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-all hover:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-500/50 cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <span className={cn("truncate", !selectedOption && "text-slate-400")}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-40" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto rounded-xl shadow-xl border-slate-100">
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500 italic">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors hover:bg-emerald-50 hover:text-emerald-700",
                  value === option.value && "bg-emerald-50 text-emerald-700 font-medium"
                )}
                onClick={() => {
                  if (onChange) {
                    onChange({ target: { value: option.value, name } })
                  }
                }}
              >
                {option.label}
                {value === option.value && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
Select.displayName = "Select"
