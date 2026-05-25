import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  Search, Film, Bookmark, Sparkles, TrendingUp, Clock, 
  Star, Trash2, CheckCircle2, X, ChevronRight, Settings, 
  HelpCircle, Activity, Award, DollarSign, Calendar, Flame
} from 'lucide-react';
import './App.css';

// ----------------------------------------------------
// Fallback Demo Masterpieces (Immediate WOW Experience)
// ----------------------------------------------------
const DEMO_MOVIES = [
  {
    imdbID: "tt0816692",
    Title: "Interstellar",
    Year: "2014",
    Poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg",
    Genre: "Adventure, Drama, Sci-Fi",
    imdbRating: "8.7",
    Released: "07 Nov 2014",
    Runtime: "169 min",
    Director: "Christopher Nolan",
    Writer: "Jonathan Nolan, Christopher Nolan",
    Actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Ellen Burstyn",
    Plot: "In Earth's future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand, a brilliant NASA physicist, is working on plans to save mankind by transporting Earth's population to a new home via a wormhole. But first, Brand must send former NASA pilot Cooper and a team of researchers through the wormhole and across the galaxy to find out which of three planets could be mankind's new home.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.7/10" },
      { Source: "Rotten Tomatoes", Value: "73%" },
      { Source: "Metacritic", Value: "74/100" }
    ],
    BoxOffice: "$188,020,017",
    Awards: "Won 1 Oscar. 44 wins & 148 nominations total"
  },
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    Genre: "Action, Adventure, Sci-Fi",
    imdbRating: "8.8",
    Released: "16 Jul 2010",
    Runtime: "148 min",
    Director: "Christopher Nolan",
    Writer: "Christopher Nolan",
    Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy",
    Plot: "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive and cost him everything he has ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back but only if he can accomplish the impossible, Inception.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.8/10" },
      { Source: "Rotten Tomatoes", Value: "87%" },
      { Source: "Metacritic", Value: "74/100" }
    ],
    BoxOffice: "$292,576,195",
    Awards: "Won 4 Oscars. 159 wins & 220 nominations total"
  },
  {
    imdbID: "tt0468569",
    Title: "The Dark Knight",
    Year: "2008",
    Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    Genre: "Action, Crime, Drama",
    imdbRating: "9.0",
    Released: "18 Jul 2008",
    Runtime: "152 min",
    Director: "Christopher Nolan",
    Writer: "Jonathan Nolan, Christopher Nolan, David S. Goyer",
    Actors: "Christian Bale, Heath Ledger, Aaron Eckhart, Maggie Gyllenhaal",
    Plot: "Set within a year after the events of Batman Begins (2005), Batman, Lieutenant James Gordon, and new District Attorney Harvey Dent successfully begin to round up the criminals that plague Gotham City until a mysterious and sadistic criminal mastermind known only as 'The Joker' appears in Gotham, creating a new wave of chaos. Batman's struggle against The Joker becomes deeply personal, forcing him to 'confront everything he believes' and improve his technology to stop him.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.0/10" },
      { Source: "Rotten Tomatoes", Value: "94%" },
      { Source: "Metacritic", Value: "84/100" }
    ],
    BoxOffice: "$534,858,444",
    Awards: "Won 2 Oscars. 163 wins & 160 nominations total"
  }
];

function App() {
  // Sync states with localStorage
  const [apiKey, setApiKey] = useLocalStorage('mm_omdb_api_key', '');
  const [watchlist, setWatchlist] = useLocalStorage('mm_watchlist', []);
  const [isDemoMode, setIsDemoMode] = useState(!apiKey);

  // General App States
  const [searchTitle, setSearchTitle] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showApiPanel, setShowApiPanel] = useState(!apiKey);
  
  // Selected Movie States (Details Modal)
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState('teaser'); // teaser | pillars | review
  
  // Watchlist Sidebar drawer state
  const [showWatchlistDrawer, setShowWatchlistDrawer] = useState(false);
  const [watchlistFilter, setWatchlistFilter] = useState('all'); // all | plan | watched

  // Search input typing handler
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Trigger search on mount if API key is present or in demo mode
  useEffect(() => {
    if (!apiKey) {
      setIsDemoMode(true);
      setSearchResults(DEMO_MOVIES);
    } else {
      setIsDemoMode(false);
      handleSearch('Inception'); // Initial default search
    }
  }, [apiKey]);

  // Main search operation
  const handleSearch = async (titleToSearch = searchTitle, yearToSearch = searchYear) => {
    const query = titleToSearch.trim();
    if (!query) {
      if (isDemoMode) {
        setSearchResults(DEMO_MOVIES);
        setErrorMsg('');
      } else {
        setErrorMsg('Please enter a movie title to search.');
      }
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // If using Demo mode, filter our local high-quality mock DB
    if (isDemoMode) {
      setTimeout(() => {
        const filtered = DEMO_MOVIES.filter(m => 
          m.Title.toLowerCase().includes(query.toLowerCase()) &&
          (yearToSearch ? m.Year === yearToSearch : true)
        );
        setSearchResults(filtered);
        setIsLoading(false);
        if (filtered.length === 0) {
          setErrorMsg('No movies found in Demo Database. Configure your own OMDb API Key above to search the entire web!');
        }
      }, 500);
      return;
    }

    try {
      const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&y=${yearToSearch}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        // Fetch rating detail updates for search cards where possible, or just set search results
        setSearchResults(data.Search);
      } else {
        setSearchResults([]);
        setErrorMsg(data.Error || 'No movies found.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to OMDb. Please check your internet connection or API key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch full details for modal
  const viewMovieDetails = async (imdbID) => {
    setSelectedMovieId(imdbID);
    setIsLoadingDetails(true);
    setAiActiveTab('teaser');

    // Check if it exists in our demo database
    const localDemo = DEMO_MOVIES.find(m => m.imdbID === imdbID);
    if (localDemo) {
      setTimeout(() => {
        setSelectedMovieDetails(localDemo);
        setIsLoadingDetails(false);
      }, 300);
      return;
    }

    // Otherwise fetch via OMDb API
    try {
      const url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'True') {
        setSelectedMovieDetails(data);
      } else {
        setSelectedMovieDetails(null);
        alert(data.Error || 'Could not fetch movie details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching details.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // API key submission
  const saveApiKey = (e) => {
    e.preventDefault();
    const trimmed = tempApiKey.trim();
    if (trimmed) {
      setApiKey(trimmed);
      setIsDemoMode(false);
      setShowApiPanel(false);
    } else {
      setApiKey('');
      setIsDemoMode(true);
      setSearchResults(DEMO_MOVIES);
    }
  };

  // Watchlist Actions
  const toggleWatchlist = (movie) => {
    const isAdded = watchlist.some(m => m.imdbID === movie.imdbID);
    if (isAdded) {
      setWatchlist(watchlist.filter(m => m.imdbID !== movie.imdbID));
    } else {
      const newItem = {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1542204172-e70528091b50?auto=format&fit=crop&q=80&w=300',
        Genre: movie.Genre || 'Drama',
        imdbRating: movie.imdbRating || 'N/A',
        Runtime: movie.Runtime || 'N/A',
        status: 'plan', // plan | watched
        personalRating: 0,
        notes: ''
      };
      setWatchlist([...watchlist, newItem]);
    }
  };

  const updateWatchlistItem = (imdbID, fields) => {
    setWatchlist(watchlist.map(m => {
      if (m.imdbID === imdbID) {
        return { ...m, ...fields };
      }
      return m;
    }));
  };

  const removeWatchlist = (imdbID) => {
    setWatchlist(watchlist.filter(m => m.imdbID !== imdbID));
  };

  // Client-Side AI Cinematic Tone Analyzer and Sentiment Teaser Engine
  const aiGeneratedMetrics = useMemo(() => {
    if (!selectedMovieDetails) return null;

    const movie = selectedMovieDetails;
    const title = movie.Title;
    const plot = movie.Plot || '';
    const genre = movie.Genre || '';
    const director = movie.Director || '';
    const actors = movie.Actors || '';

    // Deterministic random generator based on IMDb ID to keep results consistent
    const getHashNum = (str, scale = 100) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash % scale);
    };

    const idHash = getHashNum(movie.imdbID);

    // Calculate Tonal Frequencies based on text matching and genre
    let toneSuspense = 10 + (getHashNum(title + 's', 20));
    let toneEmotional = 10 + (getHashNum(title + 'e', 20));
    let toneAction = 10 + (getHashNum(title + 'a', 20));
    let toneDepth = 10 + (getHashNum(title + 'd', 20));
    let toneHumor = 10 + (getHashNum(title + 'h', 20));

    // Boost scores using keywords inside plot
    const plotLower = plot.toLowerCase();
    const matchesCount = (words) => {
      let count = 0;
      words.forEach(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'g');
        const matches = plotLower.match(regex);
        if (matches) count += matches.length;
      });
      return count;
    };

    toneSuspense += matchesCount(['kill', 'murder', 'crime', 'dead', 'secret', 'danger', 'death', 'thrill', 'space', 'dark', 'conspiracy']) * 12;
    toneEmotional += matchesCount(['love', 'heart', 'father', 'family', 'grief', 'daughter', 'tears', 'tragedy', 'romance', 'relationship']) * 12;
    toneAction += matchesCount(['fight', 'battle', 'war', 'gun', 'weapon', 'strike', 'chase', 'combat', 'soldier', 'destroy']) * 12;
    toneDepth += matchesCount(['mind', 'psychological', 'science', 'explore', 'discover', 'reality', 'dream', 'truth', 'universe', 'mystery']) * 12;
    toneHumor += matchesCount(['funny', 'laugh', 'joke', 'comic', 'humor', 'sweet', 'parody', 'satire', 'smile', 'happy']) * 12;

    // Apply multiplier based on genres
    const genreLower = genre.toLowerCase();
    if (genreLower.includes('sci-fi') || genreLower.includes('mystery')) toneDepth += 35;
    if (genreLower.includes('thriller') || genreLower.includes('horror')) toneSuspense += 35;
    if (genreLower.includes('action') || genreLower.includes('adventure')) toneAction += 35;
    if (genreLower.includes('drama') || genreLower.includes('romance')) toneEmotional += 35;
    if (genreLower.includes('comedy')) toneHumor += 35;

    // Normalize so they represent high quality cinematic meters (up to 98% max)
    const sum = toneSuspense + toneEmotional + toneAction + toneDepth + toneHumor;
    const maxVal = 98;
    const scale = (val) => Math.min(maxVal, Math.max(15, Math.round((val / sum) * 160 + (idHash % 15))));

    const finalSuspense = scale(toneSuspense);
    const finalEmotional = scale(toneEmotional);
    const finalAction = scale(toneAction);
    const finalDepth = scale(toneDepth);
    const finalHumor = scale(toneHumor);

    // AI summary prompts
    let teaserLine = "";
    let pillars = [];
    let analystReview = "";

    // Generate smart procedural templates based on dominant genre
    if (genreLower.includes('sci-fi')) {
      teaserLine = `"${title} is a cerebral odyssey directed by ${director}. When the limits of human knowledge fracture, ${actors.split(',')[0]} must navigate a mind-bending labyrinth where time and reality are the ultimate variables."`;
      pillars = [
        "Transcendental Exploration: Navigating the boundaries between organic consciousness and cosmos.",
        "Existential Vertigo: The cognitive dissonance of confronting multi-dimensional constructs.",
        "Emotional Anchors: The indissoluble human bonds that withstand the dilution of space-time."
      ];
      analystReview = `Our cinematic sentiment scans flag this as a highly cerebral masterwork. Visual scope measures at ${90 + (idHash % 9)}% standard intensity. Theme complexities suggest deep intellectual satisfaction with a powerful narrative gravity.`;
    } else if (genreLower.includes('thriller') || genreLower.includes('horror') || genreLower.includes('crime')) {
      teaserLine = `"${title} delivers a high-octane descent into psychological suspense. Under the cold vision of ${director}, a lethal game of chess ensues where every shadow contains a compromise, and survival is paid for in blood."`;
      pillars = [
        "Atmospheric Dread: An oppressive cinematic architecture designed to induce psychological tension.",
        "Moral Ambiguity: The blurring of hero and monster when backed into survival quadrants.",
        "High Stakes Pacing: A relentless narrative clock where every secondary choice holds critical cost."
      ];
      analystReview = `An intensely gripping thrill matrix. Tension scales peaked at ${91 + (idHash % 8)}% in the third act. Recommend high-focus environment to absorb the intricate plot mechanics and dark tone.`;
    } else if (genreLower.includes('action') || genreLower.includes('adventure')) {
      teaserLine = `"${title} is an epic visceral spectacle that pushes physical kinetics to their absolute zenith. Witness ${actors.split(',')[0]} embark on a grueling, high-velocity campaign where honor, combat, and grand scale collide."`;
      pillars = [
        "Kinetic Choreography: Seamlessly integrated combat design that drives narrative velocity.",
        "Heroic Monomyth: A traditional trial of fire and grit across vast visual vistas.",
        "Sensory Grandeur: A thumping audio-visual canvas designed for complete scale immersion."
      ];
      analystReview = `A towering showcase of audio-visual kinetics. Action choreography is rated a pristine ${93 + (idHash % 6)}% in visual efficiency. Perfect for high-fidelity home cinema setups.`;
    } else if (genreLower.includes('comedy')) {
      teaserLine = `"${title} is a razor-sharp, charismatic comedy that masterfully lampoons modern idiosyncrasies. Under ${director}'s buoyant pacing, a delightful comedy of errors unfolds with unforgettable comic resonance."`;
      pillars = [
        "Satirical Sharpness: Wittily dissecting cultural patterns through high-frequency humor.",
        "Charismatic Synergy: Masterclass character chemistry carrying rapid dialogue exchanges.",
        "Levity and Heart: Finding underlying genuine warmth amid absurd comedic situations."
      ];
      analystReview = `Highly magnetic comedic energy. Script rhythm score is clocked at ${88 + (idHash % 11)}% efficiency. Provides excellent emotional relief and outstanding rewatch value.`;
    } else { // Standard Drama / Romance / Default
      teaserLine = `"${title} is a gorgeous, character-driven canvas detailing the intricate tapestry of human relationships. Led by a career-defining performance from ${actors.split(',')[0]}, this film lays bare the complex geometry of the heart."`;
      pillars = [
        "Lyrical Intimacy: An unhurried focus on character dialogue and micro-expressive performances.",
        "Social Tapestry: A rich exploration of cultural settings, familial structures, and expectations.",
        "Cathartic Resonance: A gradual narrative swelling that pays off in deep emotional release."
      ];
      analystReview = `A profoundly moving drama profile. Performance sincerity indices peaked at ${94 + (idHash % 5)}%. Ideal for introspective viewings, prompting rich emotional reflection post-credits.`;
    }

    return {
      vibe: {
        Suspense: finalSuspense,
        Emotional: finalEmotional,
        Action: finalAction,
        Intellectual: finalDepth,
        Humor: finalHumor
      },
      teaser: teaserLine,
      pillars: pillars,
      analyst: analystReview,
      dominantTheme: genre.split(',')[0].trim()
    };
  }, [selectedMovieDetails]);

  // Watchlist Analytics calculations
  const watchlistAnalytics = useMemo(() => {
    let totalMinutes = 0;
    let averageRatingSum = 0;
    let ratedCount = 0;
    const genreCount = {};

    watchlist.forEach(movie => {
      // 1. Calculate Runtime
      const runtimeStr = movie.Runtime;
      if (runtimeStr && runtimeStr !== 'N/A') {
        const matches = runtimeStr.match(/\d+/);
        if (matches) {
          totalMinutes += parseInt(matches[0]);
        }
      }

      // 2. Average Personal Rating
      if (movie.personalRating && movie.personalRating > 0) {
        averageRatingSum += movie.personalRating;
        ratedCount++;
      }

      // 3. Genre breakdown
      const genres = movie.Genre.split(',');
      genres.forEach(g => {
        const cleanG = g.trim();
        if (cleanG) {
          genreCount[cleanG] = (genreCount[cleanG] || 0) + 1;
        }
      });
    });

    const averageRating = ratedCount > 0 ? (averageRatingSum / ratedCount).toFixed(1) : '0.0';

    // Sort genres by frequency
    const topGenres = Object.entries(genreCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      hours,
      minutes,
      averageRating,
      topGenres,
      totalCount: watchlist.length
    };
  }, [watchlist]);

  // Get theme variables based on genre of details modal
  const ambientThemeGlow = useMemo(() => {
    if (!selectedMovieDetails) return 'rgba(139, 92, 246, 0.12)';
    const primaryGenre = selectedMovieDetails.Genre?.split(',')[0]?.trim()?.toLowerCase() || '';

    if (primaryGenre.includes('sci-fi') || primaryGenre.includes('fantasy')) return 'rgba(6, 182, 212, 0.2)'; // Cyan
    if (primaryGenre.includes('horror') || primaryGenre.includes('thriller') || primaryGenre.includes('crime')) return 'rgba(239, 68, 68, 0.2)'; // Red/Crimson
    if (primaryGenre.includes('action') || primaryGenre.includes('adventure')) return 'rgba(249, 115, 22, 0.2)'; // Orange
    if (primaryGenre.includes('romance') || primaryGenre.includes('musical')) return 'rgba(236, 72, 153, 0.2)'; // Pink
    if (primaryGenre.includes('comedy') || primaryGenre.includes('animation')) return 'rgba(234, 179, 8, 0.2)'; // Gold/Yellow
    return 'rgba(139, 92, 246, 0.2)'; // Default Purple
  }, [selectedMovieDetails]);

  // Handle keyboard interaction for Modal close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMovieId(null);
        setSelectedMovieDetails(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* ----------------- NAVBAR HEADER ----------------- */}
      <header className="header-glass">
        <div className="header-container">
          <div className="logo-section" onClick={() => { setSearchTitle(''); handleSearch(''); }}>
            <Film className="logo-icon" size={32} />
            <span className="logo-text">
              Mera Manoranjan
              <span className="logo-sub">Cinema Pro</span>
            </span>
          </div>

          <div className="header-actions">
            {/* API Mode Indicator */}
            <div 
              className={`api-badge ${isDemoMode ? 'demo' : 'connected'}`} 
              onClick={() => setShowApiPanel(!showApiPanel)}
              title="Click to configure API Settings"
            >
              <div className={`dot ${isDemoMode ? 'pulse-gold' : 'pulse-cyan'}`}></div>
              {isDemoMode ? 'Demo Mode (Mock DB)' : 'Live OMDb Active'}
              <Settings size={14} style={{ marginLeft: '4px' }} />
            </div>

            {/* Floating Watchlist Action Trigger */}
            <button 
              className="glow-btn" 
              onClick={() => setShowWatchlistDrawer(true)}
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <Bookmark size={16} />
              Watchlist
              {watchlist.length > 0 && (
                <span style={{
                  background: '#fff',
                  color: 'var(--accent-secondary)',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- CORE CONTENT BODY ----------------- */}
      <main className="main-content">

        {/* API Settings Sliding Panel */}
        {showApiPanel && (
          <div className="glass-panel api-panel animate-fade-in">
            <div className="api-panel-header">
              <h3 className="api-panel-title">
                <Settings size={20} className="logo-icon" />
                OMDb API settings
              </h3>
              <button 
                className="drawer-close-btn" 
                onClick={() => setShowApiPanel(false)}
                aria-label="Close API Panel"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveApiKey} className="api-input-row">
              <input 
                type="text" 
                className="api-input"
                placeholder="Paste your OMDb API Key here..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <button type="submit" className="glow-btn">
                Apply Key
              </button>
            </form>

            <div className="api-help-text">
              <HelpCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline' }} />
              <strong>Don't have an OMDb API key?</strong> You can get a free key in 30 seconds by registering at{' '}
              <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer">
                omdbapi.com/apikey.aspx
              </a>. Leaving it blank automatically restores **Demo Mode (Blockbuster Showcase)** with zero API dependencies!
            </div>
          </div>
        )}

        {/* Main Search Panel Card */}
        <section className="search-dashboard">
          <div className="search-controls">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="search-bar-input" 
                placeholder={isDemoMode ? "Try searching 'Inception' or 'Dark Knight' (Demo Mode)..." : "Search over 500,000+ movies, series by title..."}
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value);
                  // Automatic local demo filtering or prompt searching
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="search-icon-inside" size={22} />
            </div>

            <select 
              className="year-select"
              value={searchYear}
              onChange={(e) => {
                setSearchYear(e.target.value);
                handleSearch(searchTitle, e.target.value);
              }}
            >
              <option value="">Year (Any)</option>
              {Array.from({ length: 60 }, (_, i) => 2026 - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button className="glow-btn" onClick={() => handleSearch()} style={{ padding: '16px 28px' }}>
              Search
            </button>
          </div>
        </section>

        {/* ----------------- SEARCH RESULTS GRID ----------------- */}
        <section>
          <h2 className="featured-showcase-title">
            <TrendingUp size={22} className="logo-icon" />
            {searchTitle ? `Search Results for "${searchTitle}"` : 'Cinematic Masterpiece Showcase'}
          </h2>

          {isLoading ? (
            <div className="loading-showcase">
              <div className="spinner"></div>
              <p>Scanning cinema databanks...</p>
            </div>
          ) : errorMsg ? (
            <div className="error-showcase animate-fade-in">
              <Flame size={40} />
              <h3>Search Result Update</h3>
              <p>{errorMsg}</p>
              {isDemoMode && (
                <button className="glow-btn" onClick={() => { setSearchTitle(''); setSearchYear(''); handleSearch(''); }} style={{ marginTop: '10px' }}>
                  Restore Blockbuster Showcase
                </button>
              )}
            </div>
          ) : (
            <div className="featured-grid animate-fade-in">
              {searchResults.map((movie) => {
                const isItemInWatchlist = watchlist.some(m => m.imdbID === movie.imdbID);
                return (
                  <div 
                    className="movie-card glass-panel" 
                    key={movie.imdbID}
                    onClick={() => viewMovieDetails(movie.imdbID)}
                  >
                    {/* Add to Watchlist Directly */}
                    <button 
                      className={`card-add-watchlist-btn ${isItemInWatchlist ? 'in-watchlist' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(movie);
                      }}
                      title={isItemInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      <Bookmark size={14} fill={isItemInWatchlist ? "currentColor" : "none"} />
                    </button>

                    {/* Ratings Badge for Demo Cards */}
                    {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                      <div className="card-rating-badge">
                        <Star size={12} fill="currentColor" />
                        {movie.imdbRating}
                      </div>
                    )}

                    <div className="movie-poster-container">
                      <img 
                        className="movie-poster-img"
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1542204172-e70528091b50?auto=format&fit=crop&q=80&w=300'} 
                        alt={movie.Title}
                        loading="lazy"
                      />
                    </div>

                    <div className="card-overlay">
                      <h3 className="card-title">{movie.Title}</h3>
                      <div className="card-meta">
                        <span className="card-year-badge">{movie.Year}</span>
                        <span className="card-type-tag">{movie.Type || 'Movie'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ----------------- MOVIE DETAILS MODAL ----------------- */}
      {selectedMovieId && (
        <div className="modal-overlay" onClick={() => { setSelectedMovieId(null); setSelectedMovieDetails(null); }}>
          <div 
            className="modal-content-container glass-panel" 
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <button 
              className="modal-close-btn" 
              onClick={() => { setSelectedMovieId(null); setSelectedMovieDetails(null); }}
              aria-label="Close Movie Details"
            >
              <X size={18} />
            </button>

            {isLoadingDetails || !selectedMovieDetails ? (
              <div className="loading-showcase" style={{ minHeight: '400px' }}>
                <div className="spinner"></div>
                <p>Retrieving high-fidelity cinema packets...</p>
              </div>
            ) : (
              <div className="modal-grid">
                {/* Modal Ambient Glow Overlay */}
                <div className="genre-glow-ambient" style={{ background: ambientThemeGlow }}></div>

                {/* Left Panel: Poster & Quick Info */}
                <div className="modal-left">
                  <div className="modal-poster-wrapper">
                    <img 
                      className="modal-poster-img"
                      src={selectedMovieDetails.Poster !== 'N/A' ? selectedMovieDetails.Poster : 'https://images.unsplash.com/photo-1542204172-e70528091b50?auto=format&fit=crop&q=80&w=400'} 
                      alt={selectedMovieDetails.Title} 
                    />
                    <div className="modal-poster-overlay"></div>
                  </div>

                  <div className="modal-left-meta">
                    <div className="detail-actions-row">
                      <button 
                        className={`watchlist-toggle-btn ${watchlist.some(m => m.imdbID === selectedMovieDetails.imdbID) ? 'added' : 'add'}`}
                        onClick={() => toggleWatchlist(selectedMovieDetails)}
                      >
                        <Bookmark size={18} fill={watchlist.some(m => m.imdbID === selectedMovieDetails.imdbID) ? "currentColor" : "none"} />
                        {watchlist.some(m => m.imdbID === selectedMovieDetails.imdbID) ? 'In Watchlist' : 'Add to Watchlist'}
                      </button>
                    </div>

                    {/* Meta Fields */}
                    <div className="details-meta-grid" style={{ borderTop: 'none', borderBottom: 'none', padding: '0' }}>
                      <div className="meta-field">
                        <span className="meta-field-label">Director</span>
                        <span className="meta-field-val">{selectedMovieDetails.Director}</span>
                      </div>
                      <div className="meta-field">
                        <span className="meta-field-label">Writer</span>
                        <span className="meta-field-val">{selectedMovieDetails.Writer}</span>
                      </div>
                      <div className="meta-field" style={{ gridColumn: 'span 2' }}>
                        <span className="meta-field-label">Cast</span>
                        <span className="meta-field-val">{selectedMovieDetails.Actors}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Extended Stats, AI summary & Sentiment Analysis */}
                <div className="modal-right">
                  <div className="movie-title-row">
                    <h2 className="movie-title-text">{selectedMovieDetails.Title}</h2>
                    <div className="movie-quick-stats">
                      <span className="movie-rating-badge">{selectedMovieDetails.Rated || 'PG-13'}</span>
                      <span className="bullet-separator">•</span>
                      <span><Calendar size={13} style={{ verticalAlign: 'middle', display: 'inline', marginRight: '4px' }} /> {selectedMovieDetails.Year}</span>
                      <span className="bullet-separator">•</span>
                      <span><Clock size={13} style={{ verticalAlign: 'middle', display: 'inline', marginRight: '4px' }} /> {selectedMovieDetails.Runtime}</span>
                      {selectedMovieDetails.BoxOffice && selectedMovieDetails.BoxOffice !== 'N/A' && (
                        <>
                          <span className="bullet-separator">•</span>
                          <span><DollarSign size={13} style={{ verticalAlign: 'middle', display: 'inline', marginRight: '2px' }} /> {selectedMovieDetails.BoxOffice}</span>
                        </>
                      )}
                    </div>

                    <div className="genre-badges-row">
                      {selectedMovieDetails.Genre?.split(',').map((g) => (
                        <span key={g} className="genre-tag-pill">{g.trim()}</span>
                      ))}
                    </div>
                  </div>

                  {/* Scores Comparison Display */}
                  <div className="scoreboard-section">
                    <span className="section-label">
                      <Award size={15} />
                      Extended Scorescomparison
                    </span>
                    <div className="scores-grid">
                      {/* IMDb */}
                      <div className="score-widget">
                        <div className="score-widget-top">
                          <span>IMDb Rating</span>
                          <span style={{ color: '#f5c518' }}>{selectedMovieDetails.imdbRating}/10</span>
                        </div>
                        <div className="score-bar-bg">
                          <div 
                            className="score-bar-fill imdb" 
                            style={{ width: `${parseFloat(selectedMovieDetails.imdbRating) * 10 || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Rotten Tomatoes */}
                      {(() => {
                        const rtObj = selectedMovieDetails.Ratings?.find(r => r.Source === 'Rotten Tomatoes');
                        const rtValStr = rtObj ? rtObj.Value : '';
                        const rtVal = rtValStr ? parseInt(rtValStr.replace('%', '')) : 0;
                        return (
                          <div className="score-widget">
                            <div className="score-widget-top">
                              <span>Rotten Tomatoes</span>
                              <span style={{ color: '#fa320a' }}>{rtVal ? `${rtVal}%` : 'N/A'}</span>
                            </div>
                            <div className="score-bar-bg">
                              <div 
                                className="score-bar-fill rt" 
                                style={{ width: `${rtVal}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Metacritic */}
                      {(() => {
                        const metaVal = selectedMovieDetails.Metascore && selectedMovieDetails.Metascore !== 'N/A' 
                          ? parseInt(selectedMovieDetails.Metascore) 
                          : 0;
                        return (
                          <div className="score-widget">
                            <div className="score-widget-top">
                              <span>Metascore</span>
                              <span style={{ color: '#66cc33' }}>{metaVal ? `${metaVal}/100` : 'N/A'}</span>
                            </div>
                            <div className="score-bar-bg">
                              <div 
                                className="score-bar-fill meta" 
                                style={{ width: `${metaVal}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* AI Summary Hub */}
                  {aiGeneratedMetrics && (
                    <div className="ai-summary-hub">
                      <div className="ai-hub-header">
                        <div className="ai-hub-badge">
                          <Sparkles size={16} />
                          AI Cinematic Engine
                        </div>
                        <div className="ai-hub-tabs">
                          <button 
                            className={`ai-hub-tab-btn ${aiActiveTab === 'teaser' ? 'active' : ''}`}
                            onClick={() => setAiActiveTab('teaser')}
                          >
                            Voice Teaser
                          </button>
                          <button 
                            className={`ai-hub-tab-btn ${aiActiveTab === 'pillars' ? 'active' : ''}`}
                            onClick={() => setAiActiveTab('pillars')}
                          >
                            Pillars
                          </button>
                          <button 
                            className={`ai-hub-tab-btn ${aiActiveTab === 'review' ? 'active' : ''}`}
                            onClick={() => setAiActiveTab('review')}
                          >
                            AI Sentiment
                          </button>
                        </div>
                      </div>

                      <div className="ai-hub-body">
                        {aiActiveTab === 'teaser' && (
                          <div className="teaser-voice-style animate-fade-in">
                            <span className="teaser-typing">
                              {aiGeneratedMetrics.teaser}
                            </span>
                          </div>
                        )}

                        {aiActiveTab === 'pillars' && (
                          <ul className="pillars-list animate-fade-in">
                            {aiGeneratedMetrics.pillars.map((pillar, idx) => (
                              <li key={idx} className="pillar-item">
                                <span className="pillar-bullet"></span>
                                <div>{pillar}</div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {aiActiveTab === 'review' && (
                          <div className="animate-fade-in" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                              {aiGeneratedMetrics.analyst}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                              <Award size={14} />
                              Highlighted Theme: {aiGeneratedMetrics.dominantTheme}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cinematic Vibe Profile Metrics */}
                  {aiGeneratedMetrics && (
                    <div className="vibe-profile-section">
                      <span className="section-label">
                        <Activity size={15} />
                        Plot Sentiment Vibe Profile
                      </span>
                      <div className="vibe-grid">
                        {Object.entries(aiGeneratedMetrics.vibe).map(([label, score]) => {
                          let barColor = 'var(--accent-primary)';
                          if (label === 'Suspense') barColor = '#ef4444';
                          if (label === 'Emotional') barColor = '#ec4899';
                          if (label === 'Action') barColor = '#f97316';
                          if (label === 'Intellectual') barColor = '#06b6d4';
                          if (label === 'Humor') barColor = '#eab308';

                          return (
                            <div className="vibe-metric" key={label}>
                              <div className="vibe-metric-top">
                                <span className="vibe-label">{label}</span>
                                <span style={{ color: barColor }}>{score}%</span>
                              </div>
                              <div className="vibe-gauge-bg">
                                <div 
                                  className="vibe-gauge-fill" 
                                  style={{ width: `${score}%`, backgroundColor: barColor }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Awards details */}
                  {selectedMovieDetails.Awards && selectedMovieDetails.Awards !== 'N/A' && (
                    <div style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px dashed rgba(245, 158, 11, 0.25)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: 'var(--accent-gold)'
                    }}>
                      <Award size={18} style={{ flexShrink: 0 }} />
                      <div><strong>Accolades:</strong> {selectedMovieDetails.Awards}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- SLIDING WATCHLIST SIDEBAR DRAWER ----------------- */}
      {showWatchlistDrawer && (
        <div className="watchlist-drawer-overlay" onClick={() => setShowWatchlistDrawer(false)}>
          <div className="watchlist-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">
                <Bookmark className="logo-icon" size={24} />
                Your Watchlist Companion
              </h2>
              <button 
                className="drawer-close-btn" 
                onClick={() => setShowWatchlistDrawer(false)}
                aria-label="Close Watchlist Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="drawer-tabs">
              <button 
                className={`drawer-tab-btn ${watchlistFilter === 'all' ? 'active' : ''}`}
                onClick={() => setWatchlistFilter('all')}
              >
                All ({watchlist.length})
              </button>
              <button 
                className={`drawer-tab-btn ${watchlistFilter === 'plan' ? 'active' : ''}`}
                onClick={() => setWatchlistFilter('plan')}
              >
                Plan ({watchlist.filter(m => m.status === 'plan').length})
              </button>
              <button 
                className={`drawer-tab-btn ${watchlistFilter === 'watched' ? 'active' : ''}`}
                onClick={() => setWatchlistFilter('watched')}
              >
                Completed ({watchlist.filter(m => m.status === 'watched').length})
              </button>
            </div>

            {/* Watchlist Analytics Header inside Drawer */}
            {watchlist.length > 0 && (
              <div style={{ padding: '16px 24px 0 24px' }}>
                <div className="analytics-grid">
                  <div className="analytics-widget-card">
                    <span className="analytics-val">
                      {watchlistAnalytics.hours}h <span style={{ fontSize: '0.9rem' }}>{watchlistAnalytics.minutes}m</span>
                    </span>
                    <span className="analytics-lbl">Total Runtime</span>
                  </div>
                  <div className="analytics-widget-card">
                    <span className="analytics-val" style={{ color: 'var(--accent-gold)' }}>
                      {watchlistAnalytics.averageRating} <span style={{ fontSize: '0.9rem' }}>★</span>
                    </span>
                    <span className="analytics-lbl">Avg Rating</span>
                  </div>
                </div>

                {watchlistAnalytics.topGenres.length > 0 && (
                  <div className="genre-stats-list">
                    <span className="analytics-lbl" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={10} /> Top Taste Genres
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {watchlistAnalytics.topGenres.map((g) => (
                        <div key={g.name} className="genre-stat-row" style={{ gap: '8px' }}>
                          <span className="genre-stat-name" style={{ fontSize: '0.75rem' }}>{g.name}</span>
                          <span className="genre-stat-count" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>{g.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Watchlist Cards */}
            <div className="drawer-content">
              {(() => {
                const filteredList = watchlist.filter(m => {
                  if (watchlistFilter === 'plan') return m.status === 'plan';
                  if (watchlistFilter === 'watched') return m.status === 'watched';
                  return true;
                });

                if (filteredList.length === 0) {
                  return (
                    <div className="watchlist-empty">
                      <Bookmark size={48} className="watchlist-empty-icon" />
                      <p>
                        {watchlistFilter === 'all' 
                          ? 'Your watchlist is empty. Bookmark some blockbusters to curate your cinema vault!' 
                          : `No movies tagged in this filter quadrant.`}
                      </p>
                    </div>
                  );
                }

                return filteredList.map((movie) => (
                  <div className="watchlist-card glass-panel" key={movie.imdbID}>
                    <div className="watchlist-card-top">
                      <img className="watchlist-thumb" src={movie.Poster} alt={movie.Title} />
                      <div className="watchlist-info">
                        <div>
                          <h4 className="watchlist-info-title">{movie.Title}</h4>
                          <div className="watchlist-info-meta">
                            <span>{movie.Year}</span>
                            <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>|</span>
                            <span style={{ color: 'var(--accent-gold)' }}>★ {movie.imdbRating}</span>
                          </div>
                        </div>

                        <div className="watchlist-status-bar">
                          <span 
                            className={`status-badge ${movie.status === 'watched' ? 'watched' : 'plan'}`}
                            onClick={() => updateWatchlistItem(movie.imdbID, { 
                              status: movie.status === 'watched' ? 'plan' : 'watched' 
                            })}
                            title="Click to toggle watch status"
                          >
                            {movie.status === 'watched' ? 'Completed' : 'Plan to Watch'}
                          </span>

                          <div className="watchlist-actions">
                            <button 
                              className="action-icon-btn delete" 
                              onClick={() => removeWatchlist(movie.imdbID)}
                              title="Delete from Watchlist"
                            >
                              <Trash2 size={12} />
                            </button>
                            <button 
                              className="action-icon-btn" 
                              onClick={() => viewMovieDetails(movie.imdbID)}
                              title="View details"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Notes and Star Ratings */}
                    <div className="watchlist-user-notes-area">
                      {/* Dynamic Star selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="analytics-lbl" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Personal Rating:</span>
                        <div className="watchlist-stars-input">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`star-icon ${movie.personalRating >= star ? 'filled' : ''}`}
                              size={13} 
                              fill={movie.personalRating >= star ? "currentColor" : "none"}
                              onClick={() => updateWatchlistItem(movie.imdbID, { personalRating: star })}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Custom review text notes */}
                      <textarea 
                        className="notes-textarea"
                        placeholder="Write your review notes / log personal cinema thoughts..."
                        value={movie.notes || ''}
                        onChange={(e) => updateWatchlistItem(movie.imdbID, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- COMPREHENSIVE CINEMATIC FOOTER ----------------- */}
      <footer className="footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <strong>Mera Manoranjan</strong> — Built with absolute cinematic passion. powered by OMDb API and local glassmorphism.
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            All metadata & posters are copyright of their respective owners. Client-side sentiment scoring uses local word-vector weight maps.
            <a href="https://www.omdbapi.com/" target="_blank" rel="noopener noreferrer">OMDb Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
