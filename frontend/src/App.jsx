import Chart from "./components/Chart"

function App() {
  return (
    <div className="min-h-screen bg-[#131722]">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-semibold text-white/90 mb-6 text-center">Live Binance Trendline Chart</h1>
        <div className="rounded-lg border border-[#2A2E39] bg-[#1E222D] p-4 shadow-lg">
          <Chart />
        </div>
      </div>
      <footer className="text-right text-white/70 text-sm py-4 pr-12">
        Built by <a href="https://github.com/rsayyed591" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Rehan Sayyed</a>
      </footer>
    </div>
  )
}

export default App

