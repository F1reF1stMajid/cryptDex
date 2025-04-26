import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2"; // Import the chart component
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary chart elements
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function CoinDetail() {
  const { id } = useParams();
  const [coinDetail, setCoinDetail] = useState(null);
  const [coinHistory, setCoinHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCoinDetail = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`);
        setCoinDetail(res.data);
        setIsLoading(false);
        setHasError(false);
      } catch (err) {
        setIsLoading(false);
        setHasError(true);
        console.error("Error fetching data:", err);
      }
    };

    // Fetch coin history data for chart
    const fetchCoinHistory = async () => {
      try {
        const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
          params: {
            vs_currency: 'usd', // Set your preferred currency
            days: '30', // Last 30 days of data
          },
        });
        setCoinHistory(res.data.prices); // Data format: [[timestamp, price], ...]
      } catch (err) {
        console.error("Error fetching coin history", err);
        setHasError(true); // Show error if history fails to load
      }
    };

    fetchCoinDetail();
    fetchCoinHistory();
  }, [id]);

  // Format data for chart
  const chartData = {
    labels: coinHistory.map((item) => new Date(item[0]).toLocaleDateString()), // Convert timestamps to readable dates
    datasets: [
      {
        label: "Price (USD)",
        data: coinHistory.map((item) => item[1]), // Price values
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      {isLoading && <div>Loading coin details and chart...</div>}
      {hasError && <div>Failed to load coin details or historical data. Please try again later.</div>}

      {coinDetail && (
        <div>
          <h2>{coinDetail.name}</h2>
          <img src={coinDetail.image.large} alt={coinDetail.name} />
          <p>{coinDetail.description.en}</p>

          {/* Check if coin history is available */}
          {coinHistory.length === 0 && !isLoading && !hasError && (
            <div>No historical data available for this coin.</div>
          )}

          {/* Display the chart */}
          {coinHistory.length > 0 && (
            <div style={{ width: '100%', height: '400px' }}>
              <Line data={chartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoinDetail;
