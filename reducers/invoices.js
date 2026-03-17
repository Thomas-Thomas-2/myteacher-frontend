import { createSlice } from "@reduxjs/toolkit";

const initialState = { value: [] };

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setInvoices: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setInvoices } = invoicesSlice.actions;
export default invoicesSlice.reducer;
