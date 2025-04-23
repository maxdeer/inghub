import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './employeeSlice.js';

export const store = configureStore({
  reducer: {
    employees: employeeReducer
  }
});

store.subscribe(() => {
  clearTimeout(window.__persistTimer);
  window.__persistTimer = setTimeout(() => {
    localStorage.setItem('employees', JSON.stringify(store.getState().employees));
  }, 250);
}); 