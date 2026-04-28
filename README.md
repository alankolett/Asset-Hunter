# 📡 Asset-Hunter: Digital Rights Reconnaissance

Asset-Hunter is an automated threat intelligence platform designed to combat the unauthorized misappropriation of proprietary sports media. Built during the Solution Challenge 2026, it leverages multimodal AI to actively scan suspected URLs, evaluating visual anomalies and linguistic intent to detect piracy at scale.

## 🚀 The Solution
Traditional digital rights management relies on static hashes or rigid watermarking, which are easily bypassed. Asset-Hunter acts as an automated cybersecurity analyst. It doesn't just look at a file; it reads the context. By evaluating a scraped image alongside the surrounding metadata (like a tweet saying "free stream link in bio"), the AI can accurately determine intent and drastically reduce false positives.

### Key Features
*   **Automated Web Reconnaissance:** Scrapes target URLs to extract media payloads and contextual text.
*   **Contextual AI Analysis:** Uses Google Gemini 1.5 Flash (Vision + NLP) to analyze visual anomalies (betting watermarks, fake UI) and piracy lexicon.
*   **Threat Intelligence Dashboard:** A React-based Command & Control (C2) interface displaying actionable threat data.
*   **Persistent Threat Logging:** Integrates with Supabase (PostgreSQL) to maintain a historical database of scanned targets and their threat levels.

## 🛠️ Architecture & Technologies
*   **Frontend C2 Dashboard:** React, Vite, Tailwind CSS (Hosted on Vercel)
*   **Reconnaissance Backend:** Node.js, Express.js (Hosted on Render)
*   **AI Engine:** Google Gemini API
*   **Database:** Supabase (PostgreSQL)

## ⚙️ Local Installation
If you wish to run Asset-Hunter locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/asset-hunter.git](https://github.com/YOUR_USERNAME/asset-hunter.git)
    cd asset-hunter
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your keys (do not use quotes):
    ```env
    GEMINI_API_KEY=your_gemini_key_here
    SUPABASE_URL=your_supabase_url_here
    SUPABASE_KEY=your_supabase_anon_key_here
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🔒 Security Note
Do not expose your `.env` file. Ensure it is included in your `.gitignore` before pushing to any public repository.
