import { RowSelectionState } from "@tanstack/react-table";
import { atom } from "jotai";
import { create } from "zustand";
export const selectListUsersAtom = atom<RowSelectionState>({});

interface SelectListUsersAtom {
  values: RowSelectionState;
  setRowSelection: (id: string, value: boolean) => void;
  setRowsSelection: (values: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  hasExistingSelection: (id: string) => boolean;
}
export const useSelectListUsers = create<SelectListUsersAtom>((set, get) => ({
  values: {},
  setRowSelection: (id: string, value: boolean) => {
    set((state) => ({
      ...state,
      values: {
        ...state.values,
        [id]: value,
      },
    }));
  },

  hasExistingSelection: (id: string) => {
    const value = get().values[id];

    return value !== undefined;
  },

  setRowsSelection: (values: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
    set((state) => ({
      ...state,
      values: typeof values === "function" ? values(state.values) : values,
    }));
  }
}));