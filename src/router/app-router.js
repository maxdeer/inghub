import '../components/employee-list/EmployeeList.js';
import '../components/employee-form/EmployeeForm.js';

export const appRoutes = [
  { path: '/', redirect: '/employees' },
  { path: '/employees', component: 'employee-list' },
  { path: '/employees/new', component: 'employee-form' },
  { path: '/employees/:id/edit', component: 'employee-form' }
];
window.appRoutes = appRoutes; 