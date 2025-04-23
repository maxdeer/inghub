import { css } from 'lit';

// Shared base styles for form elements like input, select, label
export const formElementStyles = css`
  .field-group,
  .field-pair { /* Allow either class name */
    margin-bottom: 1rem; /* Consistent bottom margin */
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gray-700, #374151);
    display: block;
    margin-bottom: 0.375rem;
  }

  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="date"],
  input[type="search"],
  select {
    width: 100%;
    padding: var(--input-padding-y, 0.625rem) var(--input-padding-x, 0.75rem);
    border: 1px solid var(--gray-300, #d1d5db);
    border-radius: var(--input-border-radius, 0.375rem);
    font-size: 0.875rem;
    background-color: white;
    color: var(--gray-900, #111827);
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    box-sizing: border-box; /* Include padding/border in width */
    line-height: 1.5; /* Ensure consistent height */
    min-height: calc(1.5em + var(--input-padding-y, 0.625rem) * 2 + 2px); /* Match height approx */
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: var(--primary-color, #ff6600);
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
    z-index: 1; /* Ensure focus ring is on top */
  }

  /* Style for explicitly marked invalid inputs */
  input.input-invalid,
  select.input-invalid {
      border-color: var(--red-600, #dc2626) !important; /* Use important to override potential browser styles */
      /* Optional: Add a subtle box-shadow for more emphasis */
      box-shadow: 0 0 0 1px var(--red-600, #dc2626);
  }
  input.input-invalid:focus,
  select.input-invalid:focus {
     /* Ensure focus style overrides invalid style */
     border-color: var(--primary-color, #ff6600) !important;
     box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
  }

  /* Select Specific Styling */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  /* Date Input Specific Styling */
  input[type="date"] {
     position: relative; /* Needed for icon overlay if used */
     /* Use system font for date input for better compatibility */
     font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  /* Hide the default icon and use a background image or custom element if desired */
  input[type="date"]::-webkit-calendar-picker-indicator {
     /* display: none; */ /* Uncomment to hide default icon */
     /* -webkit-appearance: none; */
     opacity: 0.6; /* Make default icon less prominent */
     cursor: pointer;
     padding-right: 0.5rem;
  }

  .error-message {
    color: var(--red-600, #dc2626);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.25rem; /* Space above error */
    /* width: 100%; */ /* Ensure it takes width if needed */
  }

`; 