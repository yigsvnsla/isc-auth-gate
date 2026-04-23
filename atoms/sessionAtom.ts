import { atom } from "jotai";
import { authClient } from "@/lib/auth-client";


export const sessionAtom = atom<typeof authClient.$Infer.Session>(
  
)