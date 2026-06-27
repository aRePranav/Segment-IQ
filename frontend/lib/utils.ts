import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export const SEGMENT_COLORS: Record<string, string> = {
  Champions: "#F5F5F5",
  "Potential Loyalists": "#9FB4C7",
  "New Customers": "#7FA88E",
  "At Risk Customers": "#D08B6A",
};
