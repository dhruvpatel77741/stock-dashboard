import { useEffect, useState } from "react";
import axios from "axios";

const STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NFLX", "NVDA", "INTC"];
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

function App() {
  const [stocksData, setStocksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStockData() {
      try {
        const stockRequests = STOCK_SYMBOLS.map(async (symbol) => {
          const response = await axios.get("https://finnhub.io/api/v1/quote", {
            params: {
              symbol,
              token: API_KEY,
            },
          });
          return { symbol, ...response.data };
        });

        const results = await Promise.all(stockRequests);
        setStocksData(results);
      } catch (error) {
        setErrorMessage("Failed to fetch stock data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStockData();
  }, []);

  const filteredStocks = stocksData.filter((stock) =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Stock Dashboard
        </h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search stock symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded p-2 w-full max-w-xs focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {isLoading && (
          <div className="text-center text-lg text-gray-600 animate-pulse">
            Loading stocks...
          </div>
        )}

        {errorMessage && (
          <div className="text-center text-red-500 text-lg">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6 text-left">Symbol</th>
                  <th className="py-3 px-6 text-left">Price</th>
                  <th className="py-3 px-6 text-left">Change %</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">{stock.symbol}</td>
                      <td className="py-3 px-6">
                        {stock.c !== undefined ? `$${stock.c.toFixed(2)}` : "N/A"}
                      </td>
                      <td
                        className={`py-3 px-6 ${
                          stock.dp >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.dp !== undefined ? `${stock.dp.toFixed(2)}%` : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-gray-500 italic">
                      No stocks match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
