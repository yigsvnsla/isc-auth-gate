import { atom } from "jotai";
import { selectListOrgsAtom } from "./select-list-orgs-atom";

export const selectListOrgsIdAtom = atom((get) =>
  Object.keys(get(selectListOrgsAtom)).filter((_, i, arr) => arr[i]),
);
