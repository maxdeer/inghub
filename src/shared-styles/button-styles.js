import { css } from 'lit';

export const buttonBaseStyles = css`
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: var(--button-padding-y, 0.625rem) var(--button-padding-x, 1.5rem);
    border: 1px solid transparent;
    border-radius: var(--input-border-radius, 0.375rem);
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    line-height: 1.25; /* Ensure consistent line height */
  }

  .button svg,
  .button-icon { /* Class for standalone icon if needed */
    width: 1.125rem; /* 18px */
    height: 1.125rem; /* 18px */
    flex-shrink: 0; /* Prevent icon shrinking */
  }

  /* Primary Button Style (Submit/Confirm) */
  .button-primary,
  .button-submit { /* Allow either class */
    background-color: var(--primary-color, #ff6600);
    color: white;
    border-color: var(--primary-color, #ff6600);
  }
  .button-primary:hover,
  .button-submit:hover {
    background-color: var(--primary-color-darker, #ea580c);
    border-color: var(--primary-color-darker, #ea580c);
  }
  .button-primary:focus-visible,
  .button-submit:focus-visible {
     outline: none;
     box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5); 
  }


  /* Cancel/Secondary Button Style */
  .button-cancel,
  .button-secondary { /* Allow either class */
    background-color: white;
    color: var(--gray-700, #374151);
    border-color: var(--gray-300, #d1d5db);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .button-cancel:hover,
  .button-secondary:hover {
    background-color: var(--gray-50, #f9fafb);
    border-color: var(--gray-400, #9ca3af);
  }
   .button-cancel:focus-visible,
   .button-secondary:focus-visible {
     outline: none;
     border-color: var(--primary-color, #ff6600); /* Use primary color for focus border */
     box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
   }


  /* Destructive Button Style (e.g., Delete) */
  .button-destructive {
    background-color: var(--red-600, #dc2626);
    color: white;
    border-color: var(--red-600, #dc2626);
  }
  .button-destructive:hover {
    background-color: var(--red-700, #b91c1c);
    border-color: var(--red-700, #b91c1c);
  }
  .button-destructive:focus-visible {
     outline: none;
     box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(220, 38, 38, 0.5); /* Red focus ring */
  }

  /* Simple Action Button (e.g., Edit/Delete icons in tables) */
  .button-action {
    background: none;
    border: none;
    padding: 0.375rem;
    margin: 0 0.125rem;
    cursor: pointer;
    color: var(--primary-color, #ff6600);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px; /* Make round */
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
  }
  .button-action:hover {
    color: var(--primary-color-darker, #ea580c);
    background-color: var(--primary-light, #fff7ed);
  }
  .button-action svg {
    width: 1.125rem;
    height: 1.125rem;
    stroke-width: 1.5; /* Common stroke for icons */
    display: block;
  }
  .button-action:focus-visible {
     outline: none;
     background-color: var(--primary-light, #fff7ed);
     box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
   }

  .button-lang {
    background: none;
    border: 1px solid transparent;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--gray-600, #4b5563);
    border-radius: var(--input-border-radius, 0.375rem);
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    line-height: 1.5;
  }
  .button-lang.active {
      font-weight: 700;
      color: var(--primary-color, #ff6600);
      border-color: var(--primary-color, #ff6600);
      background-color: var(--primary-light, #fff7ed);
  }
  .button-lang:not(.active):hover {
      background-color: var(--gray-100, #f3f4f6);
      color: var(--gray-800, #1f2937);
  }
   .button-lang:focus-visible {
      outline: none;
      border-color: var(--primary-color, #ff6600);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
   }
`; 