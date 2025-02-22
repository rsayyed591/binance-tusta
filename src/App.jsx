import ChartComponent from "./components/ChartComponent"

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="chart-title text-2xl">Live Binance Trendline Chart</h1>
        <ChartComponent />
      </div>
    </div>
  )
}

export default App

