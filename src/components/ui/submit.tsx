"use client";
import { useFormStatus } from "react-dom";
import { buttonClass } from "./primitives";

export function Submit({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "outline" | "danger" | "ghost" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant)}>
      {pending ? "Working..." : children}
    </button>
  );
}
