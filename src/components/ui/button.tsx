import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "neu text-foreground hover:scale-[0.98] active:neu-pressed bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl",
        destructive: "neu text-foreground hover:scale-[0.98] active:neu-pressed bg-gradient-to-br from-destructive to-red-600 text-destructive-foreground",
        outline: "neu text-foreground hover:scale-[0.98] active:neu-pressed border-2 border-primary/20",
        secondary: "neu text-foreground hover:scale-[0.98] active:neu-pressed bg-gradient-to-br from-secondary to-blue-500 text-secondary-foreground",
        ghost: "bg-transparent hover:neu-sm text-foreground",
        link: "text-primary underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-2xl",
        sm: "h-9 px-3 rounded-xl",
        lg: "h-12 px-8 rounded-3xl",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
