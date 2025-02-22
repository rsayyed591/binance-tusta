import axios from "axios"

export const fetchBinanceData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BINANCE_API_URL}/api/v3/klines`, {
      params: {
      symbol: "BTCUSDT",
      interval: "1m",
      limit: 60,
      },
    })
    console.log("Binance data:", response.data)
    // Format data for line chart
    return response.data.map((item) => ({
      time: item[0], // timestamp
      price: Number.parseFloat(item[4]), // closing price
    }))
  } catch (error) {
    console.error("Error fetching Binance data:", error)
    return []
  }
}

