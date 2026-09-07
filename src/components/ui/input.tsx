import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      suppressHydrationWarning
      className={cn(
        "h-12 w-full rounded-[14px] bg-surface px-3.5 text-sm text-fg shadow-[var(--shadow-border)]",
        "placeholder:text-subtle outline-none transition-[box-shadow] duration-150",
        "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-[16px] bg-surface px-3.5 py-2.5 text-sm text-fg shadow-[var(--shadow-border)]",
      "placeholder:text-subtle outline-none transition-[box-shadow] duration-150",
      "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium tracking-wide text-muted", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-12 w-full appearance-none rounded-[14px] bg-surface px-3.5 text-sm text-fg shadow-[var(--shadow-border)]",
        "outline-none transition-[box-shadow] duration-150",
        "focus:shadow-[var(--shadow-border-hover)] focus:ring-2 focus:ring-ring/30",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
