# Employee Management App

A simple web application for managing employee data.

## Prerequisites

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)

## Setup

1.  Clone the repository.
2.  Navigate to the project directory:
    ```bash
    cd inghub 
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Development Server

To start the local development server (usually on http://localhost:5173):

```bash
npm run dev
```

The application will open in your default browser, or you can navigate to the specified port.

## Running Tests

To run the unit and integration tests using Web Test Runner:

```bash
npm test
```

This will typically run the tests once in headless browsers (check `package.json` for exact configuration). You might also have a watch mode script:

```bash
# Example: If defined in package.json
npm run test:watch 
``` 

```bash
# Example coverage score
npm run test:coverage 
``` 
