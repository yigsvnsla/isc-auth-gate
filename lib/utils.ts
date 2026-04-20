import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const shortName = (name: string) =>
  name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()