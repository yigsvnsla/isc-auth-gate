import { atom } from "jotai";

export const paramListUsersAtom = atom({
  searchValue: "",
  searchField: "",
  pageIndex: 0,
  pageSize: 10,
});
