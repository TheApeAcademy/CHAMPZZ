"use client";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonVariant } from "./primitives";

export function Submit({ children, variant = "primary", size = "md", className = "" }: { children: React.ReactNode; variant?: ButtonVariant; size?: "md" | "lg"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending || undefined} className={`${buttonClass(variant, size)} ${className}`}>
      {pending ? (
        <>
          <span aria-hidden="true" className="h-[18px] w-[18px] animate-spin rounded-full border-[3px] border-current border-r-transparent" />
          Working...
        </>
      ) : children}
    </button>
  );
}
