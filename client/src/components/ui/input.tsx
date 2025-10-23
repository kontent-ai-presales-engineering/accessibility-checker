import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 min-h-10 w-full rounded-full border border-input bg-white px-4 py-2.5 text-sm font-normal leading-5 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-black disabled:cursor-not-allowed disabled:border-[#C6C6C6] disabled:bg-[#DFDFDF] disabled:text-[#8C8C8C] overflow-clip",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
