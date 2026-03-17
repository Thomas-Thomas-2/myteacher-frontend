import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    getPayments: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { getPayments } = paymentSlice.actions;
export default paymentSlice.reducer;
