import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = JSON.parse(localStorage.getItem('employees') || '[]');

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare(emp) {
        return { payload: { id: nanoid(), ...emp } };
      }
    },
    updateEmployee(state, action) {
      const idx = state.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state[idx] = action.payload;
    },
    deleteEmployee(state, action) {
      return state.filter(e => e.id !== action.payload);
    }
  }
});

export const { addEmployee, updateEmployee, deleteEmployee } = employeeSlice.actions;
export default employeeSlice.reducer; 