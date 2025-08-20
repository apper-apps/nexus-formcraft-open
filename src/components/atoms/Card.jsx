import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  children, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-white rounded-xl shadow-card hover:shadow-card-hover border border-gray-100",
    ghost: "bg-transparent",
    elevated: "bg-white rounded-xl shadow-xl border border-gray-100"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;