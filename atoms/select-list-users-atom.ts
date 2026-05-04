import { RowSelectionState } from "@tanstack/react-table";
import { atom } from "jotai";

export const selectListUsersAtom = atom<RowSelectionState>({});
