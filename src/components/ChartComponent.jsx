"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { fetchBinanceData } from "../utils/api"
import Chart from "chart.js/auto"
import "chartjs-adapter-date-fns" // Add this import for date handling
import { ChevronDown, BarChart2, AlertCircle, Rewind, Settings } from "lucide-react"
import Modal from "./Modal"

const ChartComponent = () => {
  const chartRef = useRef(null)
  const [chartInstance, setChartInstance] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [trendlines, setTrendlines] = useState([])
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const containerRef = useRef(null)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [chartInstance])

  const handleChartClick = useCallback(
    (e) => {
      if (!chartRef.current || !chartInstance) return
      const canvasPosition = Chart.helpers.getRelativePosition(e, chartInstance)

      if (!startPoint) {
        setStartPoint(canvasPosition)
      } else {
        setEndPoint(canvasPosition)
        setTrendlines((prev) => [
          ...prev,
          {
            start: startPoint,
            end: canvasPosition,
          },
        ])
        setStartPoint(null)
      }
    },
    [chartInstance, startPoint],
  )

  useEffect(() => {
    let chart = null

    const loadData = async () => {
      try {
        const data = await fetchBinanceData()

        if (chart) {
          chart.destroy()
        }

        if (!chartRef.current) return

        const ctx = chartRef.current.getContext("2d")

        // Create new chart
        chart = new Chart(ctx, {
          type: "line", // Changed to line chart for simplicity
          data: {
            labels: data.map((d) => new Date(d.time)),
            datasets: [
              {
                label: "BTCUSDT",
                data: data.map((d) => d.price),
                borderColor: "#2E86DE",
                backgroundColor: "rgba(46, 134, 222, 0.1)",
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: "index",
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
                callbacks: {
                  label: (context) => {
                    return `Price: $${context.parsed.y.toFixed(2)}`
                  },
                },
              },
            },
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "minute",
                  displayFormats: {
                    minute: "HH:mm",
                  },
                },
                grid: {
                  color: "rgba(240, 243, 250, 0.3)",
                  drawBorder: false,
                },
                ticks: {
                  font: {
                    family: "JetBrains Mono",
                    size: 11,
                  },
                  color: "#131722",
                  maxRotation: 0,
                  autoSkipPadding: 20,
                },
              },
              y: {
                grid: {
                  color: "rgba(240, 243, 250, 0.3)",
                  drawBorder: false,
                },
                ticks: {
                  font: {
                    family: "JetBrains Mono",
                    size: 11,
                  },
                  color: "#131722",
                  callback: (value) => `$${value.toFixed(2)}`,
                },
                position: "right",
              },
            },
            onClick: handleChartClick,
          },
        })

        setChartInstance(chart)
      } catch (error) {
        console.error("Error loading chart data:", error)
      }
    }

    loadData()
    const interval = setInterval(loadData, 5000)

    return () => {
      clearInterval(interval)
      if (chart) {
        chart.destroy()
      }
    }
  }, [handleChartClick])

  const handleRightClick = (event) => {
    event.preventDefault()
    if (!chartRef.current) return

    const chartArea = chartRef.current.getBoundingClientRect()
    const x = event.clientX - chartArea.left
    const y = event.clientY - chartArea.top

    setStartPoint({ x, y })
    setShowModal(true)
  }

  const handleSendData = (data) => {
    setEndPoint(data)
    setShowModal(false)
    setTrendlines((prevTrendlines) => [...prevTrendlines, { start: startPoint, end: data }])
  }

  return (
    <div className="flex flex-col w-full h-screen bg-white" ref={containerRef}>
      {/* Header */}
      <div className="bg-[#131722] text-white p-2 md:p-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-jetbrains">BTCUSDT</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex flex-wrap gap-1">
            {["1m", "5m", "15m", "1h", "D", "W", "M"].map((interval) => (
              <button
                key={interval}
                className="px-2 md:px-3 py-1 text-xs md:text-sm hover:bg-gray-700 rounded font-jetbrains"
              >
                {interval}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
          <button className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 hover:bg-gray-700 rounded">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs md:text-sm hidden md:inline">Indicators</span>
          </button>
          <button className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 hover:bg-gray-700 rounded">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs md:text-sm hidden md:inline">Alert</span>
          </button>
          <button className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 hover:bg-gray-700 rounded">
            <Rewind className="w-4 h-4" />
            <span className="text-xs md:text-sm hidden md:inline">Replay</span>
          </button>
          <Settings className="w-4 h-4" />
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-8 md:w-12 bg-white border-r border-gray-200">
          <div className="flex flex-col items-center py-4 space-y-4">
            <button className="p-1 md:p-2 hover:bg-gray-100 rounded">
              <BarChart2 className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="chart-container flex-1 relative" onContextMenu={handleRightClick}>
          <canvas ref={chartRef} className="w-full h-full"></canvas>
          {showModal && <Modal onClose={() => setShowModal(false)} onSend={handleSendData} />}
          {trendlines.map((line, index) => (
            <svg key={index} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <line
                className="trendline"
                x1={line.start.x}
                y1={line.start.y}
                x2={line.end.x}
                y2={line.end.y}
                stroke="#E74C3C"
                strokeWidth="2"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChartComponent

