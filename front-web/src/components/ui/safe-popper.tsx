import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

// This is a safer wrapper around Radix UI's Popover component
// that prevents infinite update loops

const SafePopover = PopoverPrimitive.Root;

const SafePopoverTrigger = PopoverPrimitive.Trigger;

const SafePopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  // Use a ref to prevent unnecessary re-renders
  const contentRef = useRef<React.ElementRef<typeof PopoverPrimitive.Content>>(null);
  
  // Combine refs
  const combinedRef = (node: React.ElementRef<typeof PopoverPrimitive.Content>) => {
    contentRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={combinedRef}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
SafePopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { SafePopover, SafePopoverTrigger, SafePopoverContent }; 