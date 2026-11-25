"use client";
import type { ReactNode } from "react";
import { buttonClass } from "./primitives";

export function PrintButton({ children }: { children: ReactNode }) {
  return <button type="button" onClick={() => window.print()} className={buttonClass("outline")}>{children}</button>;
}
