import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    onValueChange?: (value: string) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState("")
  const currentValue = value !== undefined ? value : internalValue
  const handleChange = onValueChange || setInternalValue

  return (
    <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext)
  if (!context) throw new Error('RadioGroupItem must be used within RadioGroup')

  const isSelected = context.value === value

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isSelected}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-slate-300 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && "border-slate-900",
        className
      )}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <div className="flex items-center justify-center h-full">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
        </div>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

