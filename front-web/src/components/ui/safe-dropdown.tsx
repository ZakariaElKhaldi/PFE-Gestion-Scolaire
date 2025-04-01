import React, { useRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

// This is a safer wrapper around Radix UI's DropdownMenu component
// that prevents infinite update loops

const SafeDropdownMenu = DropdownMenuPrimitive.Root;

const SafeDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const SafeDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  // Use a ref to prevent unnecessary re-renders
  const contentRef = useRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>>(null);
  
  // Combine refs
  const combinedRef = (node: React.ElementRef<typeof DropdownMenuPrimitive.Content>) => {
    contentRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={combinedRef}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
SafeDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const SafeDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
SafeDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export {
  SafeDropdownMenu,
  SafeDropdownMenuTrigger,
  SafeDropdownMenuContent,
  SafeDropdownMenuItem,
}; 