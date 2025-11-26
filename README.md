# Word Notebook (Kelime Defterim)

This is a simple web application to help you learn new vocabulary. You can create daily lists, add words, and practice with flashcards.

## Features

*   **Daily Lists:** Create a new notebook for each day.
*   **Word Sets:** Group your words into sets.
*   **Vocabulary:** Add English words, their Turkish meanings, and synonyms.
*   **AI Context Builder:** Select words and generate a short academic story with Turkish translation using Gemini AI.
*   **Academic Print:** A specialized print view for academic study.
*   **Flashcards:** Practice your words with a flip-card mode.
*   **PDF Export:** Save your word lists as PDF files.
*   **Flash Card PDF:** Export words in a 3x4 grid format optimized for printing. Includes double-sided mirroring logic (English front, Turkish back) and cut guides.
*   **Dark Mode:** A beautiful "Deep Sea" theme that is easy on the eyes.
*   **Mobile Friendly:** Works great on your phone and computer.

## Setup

1.  **API Key Configuration:**
    *   This project uses Gemini AI for generating stories and academic data. You need to provide your own API key.
    *   Create a `.env` file in the root directory by copying the example file:
        ```bash
        cp .env-example .env
        ```
    *   Open the `.env` file and replace `"Your API Key"` with your actual Gemini API key:
        ```env
        VITE_GEMINI_API_KEY=your_actual_api_key_here
        ```

## How to Run

1.  Install the dependencies:
    ```bash
    npm install
    ```

2.  Start the application:
    ```bash
    npm run dev
    ```

3.  Open your browser and go to the link shown (usually `http://localhost:5173`).

## Technologies

*   React
*   Chakra UI
*   TypeScript
*   Vite

Enjoy learning!
