"use client"

import { useEffect, useState, useRef } from "react"
import ReactApexChart from "react-apexcharts"
import Trendline from "./Trendline"
import AlertModal from "./Modal"
import { Loader2 } from 'lucide-react'

const Chart = () => {
  const [series, setSeries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedTrendline, setSelectedTrendline] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const chartRef = useRef(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=100")
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        const formattedData = data.map((d) => ({
          x: new Date(d[0]),
          y: [Number.parseFloat(d[1]), Number.parseFloat(d[2]), Number.parseFloat(d[3]), Number.parseFloat(d[4])],
        }))
        setSeries(formattedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setTimeout(fetchData, 10000)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const chartOptions = {
    chart: {
      type: "candlestick",
      height: 500,
      background: "#1E222D",
      animations: { enabled: true, easing: "easeinout", speed: 800 },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        formatter: (value) => {
          const date = new Date(value)
          return `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}`
        },
        style: {
          colors: "#EAECEF",
          fontFamily: "JetBrains Mono",
        },
      },
      axisBorder: {
        color: "#2A2E39",
      },
      axisTicks: {
        color: "#2A2E39",
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#EAECEF",
          fontFamily: "JetBrains Mono",
        },
        formatter: (value) => value.toFixed(2),
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "JetBrains Mono",
      },
      x: {
        show: true,
        format: "HH:mm:ss",
      },
    },
    grid: {
      borderColor: "#2A2E39",
      strokeDashArray: 1,
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#26A69A",
          downward: "#EF5350",
        },
        wick: {
          useFillColor: true,
        },
      },
    },
  }

  const handleTrendlineSelect = (trendline) => {
    setSelectedTrendline(trendline)
    setShowModal(true)
  }

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-white/80">Loading chart data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-12rem)]">
      <div className="h-full" ref={chartRef}>
        <ReactApexChart options={chartOptions} series={[{ data: series }]} type="candlestick" height="100%" />
        <Trendline chartRef={chartRef} series={series} onTrendlineSelect={handleTrendlineSelect} />
      </div>

      {showModal && (
        <AlertModal isOpen={showModal} onClose={() => setShowModal(false)} selectedTrendline={selectedTrendline} />
      )}
    </div>
  )
}

export default Chart
