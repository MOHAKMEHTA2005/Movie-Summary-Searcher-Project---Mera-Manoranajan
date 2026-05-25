# 🎬 Mera Manoranjan — Cinema Pro & Movie Summary Searcher

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/docs/transformers/index)
[![Styling](https://img.shields.io/badge/Styling-Vanilla%20CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#design--styling)

**Mera Manoranjan** (meaning *My Entertainment*) is an ultra-premium, dual-platform entertainment dashboard and movie summary searcher. The project combines a **visually stunning, feature-rich React Web Application** with a **powerful Python Command-Line Interface (CLI)** to make exploring, analyzing, and organizing your movie watchlist a phenomenal experience.

Whether you want to search thousands of movies using the live OMDb API, inspect movies through dynamic client-side AI analysis, track your cinematic progress with automated watchlist statistics, or run local abstractive text summarization using deep learning transformers—Mera Manoranjan has it all covered!

---

## 🌟 Key Features

### 🖥️ 1. React Web App (Cinema Pro)
*   **Ultra-Premium Glassmorphic Design:** A state-of-the-art dark-mode interface utilizing rich gradients, backdrop blurs, responsive grids, and elegant micro-animations.
*   **Zero-Dependency Demo Mode:** A high-quality fallback showcase of cinematic masterpieces preloaded so users can explore the app immediately without configuring API keys.
*   **Live OMDb Search & Filter:** Seamlessly search over 500,000+ movies and series by title and filter by release year in real-time.
*   **Dynamic Ambient Genre Glows:** Opening a movie's detail modal bathes the screen in a smooth backdrop glow customized to the film's genre (e.g., Cyan for Sci-Fi, Crimson for Thriller/Horror, Gold for Comedy, Orange for Action, Pink for Romance).
*   **Client-Side AI Cinematic Sentiment Engine:** A custom procedural analyzer that interprets movie metadata to generate:
    *   📊 **AI Tone Vibe Metrics:** Interactive bar charts tracking Suspense, Emotional, Action, Intellectual, and Humor levels.
    *   ✍️ **AI Generated Promotional Teasers:** Catchy, dynamic promotional hooks.
    *   🔑 **AI Cinematic Pillars:** Core thematic summaries.
    *   📰 **AI Analyst Reviews:** Introspective sentiment-based write-ups.
*   **Interactive Watchlist & Real-Time Analytics:** An elegant slide-out drawer that displays:
    *   ⏱️ **Total Watch Time:** Hours and minutes of movie content in your list.
    *   ⭐ **Average Personal Rating:** Real-time averages of your custom-rated movies.
    *   📈 **Top Genres Breakdown:** Automatic frequency analysis of the genres you track.
    *   📝 **Personal Status, Ratings, & Notes:** Change status (Plan to Watch, Watched), assign star ratings, and write personal reviews directly stored in local storage.

### 🐍 2. Python CLI Application (`cli/`)
*   **Interactive CLI Interface:** Quick command-line utility to query the OMDb API directly from the terminal.
*   **Deep Learning Abstractive Summarization:** Employs the `facebook/bart-large-cnn` pipeline from **Hugging Face Transformers** to summarize plots and queries into high-quality summaries.
*   **Direct OMDb Querying:** Easy setup and step-by-step documentation on setting up free OMDb API keys.

---

## 📂 Project Structure

```bash
Movie-Summary-Searcher-Project---Mera-Manoranajan/
├── cli/                                # Python Command-Line Application
│   ├── Mera_Manoranjan.py              # Main CLI execution script (OMDb + Hugging Face)
│   └── Documentation.txt               # Step-by-step setup guides & OMDb API key guide
├── public/                             # Public static assets
├── src/                                # Frontend React Source Code
│   ├── assets/                         # SVG icons and visual assets
│   ├── hooks/                          
│   │   └── useLocalStorage.js          # Custom React hook for persistent states
│   ├── App.css                         # Core premium stylesheet (Glassmorphism & Gradients)
│   ├── App.jsx                         # Main React layout, state handlers, and AI engines
│   ├── index.css                       # Global styles & design system tokens
│   └── main.jsx                        # React root entry point
├── index.html                          # Entry HTML document
├── vite.config.js                      # Vite bundler configuration
├── package.json                        # Node dependencies and build scripts
└── README.md                           # Comprehensive documentation (You are here!)
```

---

## 🚀 Getting Started

### 🔑 Step 1: Get a Free OMDb API Key
Both the Web App and the Python CLI can utilize a live connection to the OMDb API.
1. Visit the [OMDb API Key Registration Page](https://www.omdbapi.com/apikey.aspx).
2. Choose the **FREE** tier, enter your details, and submit.
3. Check your email, click the **activation link**, and save your API Key.

---

### 🌐 Running the React Web Application

#### 1. Install Dependencies
Navigate to the root directory and install node modules:
```bash
npm install
```

#### 2. Run the Development Server
Launch the local dev environment:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience the dashboard!

#### 3. Configure API Key in the UI
*   Click the **API Settings Gear** or **Demo Mode Badge** in the navigation bar.
*   Paste your OMDb API key and click **Apply Key** to fetch live details.
*   *Note: If left blank, the app will gracefully run in Demo Mode showcasing blockbuster classics.*

---

### 💻 Running the Python CLI Script

The Python script uses Hugging Face's summarization models to provide abstractive summaries on the fly.

#### 1. Install Required Libraries
```bash
pip install requests transformers torch torchvision torchaudio
```
*(Make sure PyTorch or TensorFlow is installed as transformers depends on a deep learning backend).*

#### 2. Configure Your Key
Open `cli/Mera_Manoranjan.py` and replace `"YOUR_KEY_HERE"` on line 5 with your actual OMDb API key:
```python
def __init__(self, api_key="YOUR_KEY_HERE"):
```

#### 3. Run the Script
Navigate into the `cli` folder and execute the file:
```bash
cd cli
python Mera_Manoranjan.py
```
Simply enter a movie name, specify a release year, choose the index of the movie you want to summarize, and watch the transformers pipeline output a summary!

---

## 🎨 Design & Styling
The styling system in `src/App.css` and `src/index.css` is customized for premium visual layouts:
*   **Colors:** Cyberpunk-inspired deep obsidian backgrounds, vibrant neon purples, glowing cyans, and warm amber accents.
*   **Glassmorphism:** Elegant semi-transparent cards using `backdrop-filter: blur(20px)` and soft border overlays for a luxurious floating look.
*   **Smooth Animations:** Fluid slide-overs, pulse states, and fading transitions to ensure interactive feedback feels tactile and professional.

---

## 🛠️ Built With

*   [Vite](https://vite.dev/) - Super-fast frontend tooling
*   [React 19](https://react.dev/) - Declarative UI development
*   [Lucide React](https://lucide.dev/) - Modern and clean iconography
*   [Python 3](https://www.python.org/) - Backend scripting & CLI execution
*   [Hugging Face Transformers](https://huggingface.co/docs/transformers) - Pipeline models for Natural Language Processing (NLP)
*   [OMDb API](https://www.omdbapi.com/) - High-quality cinematic data source

---

## 🤝 Contributing
Contributions, feature requests, and feedback are always welcome! Feel free to raise issues or submit pull requests.

Made with ❤️ by a movie enthusiast. Enjoy your **Mera Manoranjan** experience! 🍿
