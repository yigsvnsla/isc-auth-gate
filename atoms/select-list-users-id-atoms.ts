import { atom } from "jotai";
import { selectListUsersAtom } from "./select-list-users-atom";

export const selectListUsersIdAtom = atom((get) =>
  Object.keys(get(selectListUsersAtom)).filter((_, i, arr) => arr[i]),
);
