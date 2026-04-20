import { atom } from "jotai";
import { authClient } from "@workspace/auth-config/lib/client";


export const sessionAtom = atom<typeof authClient.$Infer.Session>(
  
)