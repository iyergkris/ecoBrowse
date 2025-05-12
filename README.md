# EcoBrowse

This is a Next.js web application built with Firebase Studio. It analyzes the carbon footprint of visited websites and provides eco-friendly suggestions.

Most of this app has been vibe-coded.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This starts the Next.js development server, typically on `http://localhost:9002`. Open this URL in your browser to view the application.

## Building for Production

1.  **Build the Application:**
    ```bash
    npm run build
    ```
    This command runs `next build`. The production-ready build will be placed in the `.next` directory.
2.  **Start the Production Server:**
    ```bash
    npm run start
    ```
    This starts the Next.js production server.

## Core Features

-   **Footprint Calculation:** Estimates website carbon footprint based on heuristic modeling.
-   **Score Display:** Shows the eco-efficiency score visually (higher is better).
-   **Factor Details:** Provides insights into estimated data transfer, server efficiency, and renewable energy use.
-   **Statistical Reports:** Stores browsing consumption data locally (using `localStorage`) and displays aggregated reports (Weekly, Monthly, Annual).
-   **PDF Downloads:** Allows downloading aggregated reports as PDF.
-   **Popular Sites:** Shows estimated eco-scores for common websites.
