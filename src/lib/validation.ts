import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/, "Use 3 to 40 lowercase letters, numbers or hyphens.");

/** A picture PIN: 4 picks from 12 pictures, e.g. "3-0-11-7". */
export const pinSchema = z.string().regex(/^(1[01]|[0-9])(-(1[01]|[0-9])){3}$/, "Pick 4 pictures.");

export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z]+-[a-z]+-[0-9]{2}$/);

export const POLICY_VERSION = "2026-11-25";
