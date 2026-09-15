import { RowSelectionState } from "@tanstack/react-table";
import { atom } from "jotai";

export const selectListOrgsAtom = atom<RowSelectionState>({});
