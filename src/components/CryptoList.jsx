import React from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Star, StarFill } from "react-bootstrap-icons";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoList = ({ coins, favourites, toggleFavourite }) => {
  return (
    <div className="crypto-list">
      {coins.map((coin) => {
        const chartData = {
          labels: coin.sparkline_in_7d.price.map((_, index) => index),
          datasets: [
            {
              label: `${coin.name} 24h Trend`,
              data: coin.sparkline_in_7d.price,
              fill: false,
              borderColor:
                coin.price_change_percentage_24h < 0 ? "red" : "green",
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
          ],
        };

        return (
          <div key={coin.id} className="crypto-card" style={{ position: "relative" }}>
            {/* ⭐ Favorite Toggle */}
            <button
              onClick={() => toggleFavourite(coin.id)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
              title={
                favourites.includes(coin.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {favourites.includes(coin.id) ? (
                <StarFill color="gold" />
              ) : (
                <Star />
              )}
            </button>

            <Link to={`/coin/${coin.id}`} className="coin-link">
              <img src={coin.image} alt={coin.name} width={40} />
              <div>
                <h3>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </h3>
              </div>
            </Link>
            <p>
              Price: $
              {new Intl.NumberFormat().format(coin.current_price)}
            </p>

            <p
              className={`price-change ${
                coin.price_change_percentage_24h < 0 ? "negative" : "positive"
              }`}
            >
              24h Change: {coin.price_change_percentage_24h.toFixed(2)}%
            </p>

            <div className="mini-chart">
              <Line
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CryptoList;
