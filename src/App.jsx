import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CryptoList from "./components/CryptoList";
import CoinDetail from "./components/CoinDetail";

const getInitialFavourites = () => {
  const stored = localStorage.getItem("favourites");
  return stored ? JSON.parse(stored) : [];
};

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currency, setCurrency] = useState("usd");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("market_cap_desc");
  const [darkMode, setDarkMode] = useState(false);
  const [favourites, setFavourites] = useState(getInitialFavourites());
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const toggleFavourite = (coinId) => {
    setFavourites((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: currency,
              order: sortBy,
              per_page: 20,
              page: page,
              sparkline: true,
            },
          }
        );
        setCoins(res.data);
        setIsLoading(false);
        setHasError(false);
      } catch (err) {
        setIsLoading(false);
        setHasError(true);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [currency, page, sortBy]);

  const filteredCoins = coins.filter((coin) => {
    const matchesSearch = coin.name.toLowerCase().includes(search.toLowerCase()) || 
                          coin.symbol.toLowerCase().includes(search.toLowerCase());
  
    const isFav = favourites.includes(coin.id);
  
    return showFavouritesOnly ? isFav && matchesSearch : matchesSearch;
  });
  

  return (
    <Router>
      <div className="app">
        <h1 className="title">#CryptDex💲</h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <input
          type="text"
          placeholder="Search for a coin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="gbp">GBP</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="market_cap_desc">Market Cap</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="volume_desc">Volume</option>
          <option value="id_asc">Name A-Z</option>
          <option value="id_desc">Name Z-A</option>
        </select>
        <button onClick={() => setShowFavouritesOnly(prev => !prev)}>
           {showFavouritesOnly ? "Show All Coins" : "Show Only Favourites"}
        </button>

        {isLoading && <div className="spinner">Loading...</div>}
        {hasError && (
          <p className="error-message">Something went wrong. Try again later!</p>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <CryptoList
                coins={filteredCoins}
                favourites={favourites}
                toggleFavourite={toggleFavourite}
              />
            }
          />
          <Route path="/coin/:id" element={<CoinDetail />} />
        </Routes>

        {!isLoading && !hasError && (
          <div className="pagination">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ◀ Prev
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage((prev) => prev + 1)}>
              Next ▶
            </button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
