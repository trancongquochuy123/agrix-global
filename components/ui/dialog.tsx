"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type Variant = "center" | "sheet" | "drawer";

const variantClasses: Record<Variant, string> = {
  center:
    "dlg-center left-1/2 top-1/2 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl",
  sheet: "dlg-sheet bottom-0 left-0 right-0 max-h-[88vh] rounded-t-2xl",
  drawer: "dlg-drawer left-0 top-0 h-full w-[17rem] max-w-[85vw]",
};

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: Variant;
  hideClose?: boolean;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, variant = "center", hideClose, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dlg-overlay fixed inset-0 z-50 bg-forest-950/50" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 overflow-y-auto bg-white shadow-pop focus:outline-none",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-green-50 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";
