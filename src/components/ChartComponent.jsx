import { useEffect, useState, useRef } from "react"
import ReactApexChart from "react-apexcharts"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { ChevronDown, BarChart2, AlertCircle } from "lucide-react"

const ChartComponent = () => {
  const [series, setSeries] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [crosshairPosition, setCrosshairPosition] = useState(null)
  const [trendLine, setTrendLine] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const chartRef = useRef(null)

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100")
        const data = await response.json()
        const formattedData = data.map((d) => ({
          x: new Date(d[0]),
          y: [Number.parseFloat(d[1]), Number.parseFloat(d[2]), Number.parseFloat(d[3]), Number.parseFloat(d[4])],
        }))
        setSeries(formattedData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const chartOptions = {
    chart: {
      type: "candlestick",
      height: 500,
      background: "#131722",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      events: {
        mouseMove: (event, chartContext, config) => {
          const { offsetX, offsetY } = event
          // Get chart dimensions
          const chartArea = chartContext.w.globals.dom.baseEl.querySelector(".apexcharts-inner")
          const { left, top, width, height } = chartArea.getBoundingClientRect()

          // Calculate relative position within chart
          const x = offsetX - left
          const y = offsetY - top

          if (x >= 0 && x <= width && y >= 0 && y <= height) {
            setCrosshairPosition({ x, y })
          } else {
            setCrosshairPosition(null)
          }
        },
        click: (event, chartContext, config) => {
          const { offsetX, offsetY } = event

          if (isDrawing && !trendLine?.start) {
            setTrendLine({ start: { x: offsetX, y: offsetY }, end: null })
          } else if (isDrawing && trendLine?.start) {
            setTrendLine((prev) => ({
              ...prev,
              end: { x: offsetX, y: offsetY },
            }))
            setIsDrawing(false)
            setShowModal(true)
          }
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#EAECEF",
          fontFamily: "Space Mono",
        },
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
    grid: {
      borderColor: "#2A2E39",
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#27AE60",
          downward: "#E74C3C",
        },
      },
    },
  }

  const Modal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-[480px] max-w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Alert on BTCUSDT, 1m</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="border-b mb-4">
          <div className="flex space-x-4 mb-2">
            <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600">Settings</button>
            <button className="px-4 py-2 text-gray-500">
              Notifications <span className="ml-1 bg-blue-100 text-blue-600 px-1.5 rounded">4</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trigger</label>
            <div className="grid grid-cols-2 gap-2">
              {["Only Once", "Once Per Bar", "Once Per Bar Close", "Once Per Minute"].map((option) => (
                <button key={option} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 text-left">
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expiration</label>
            <input
              type="text"
              value={format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alert name</label>
            <input type="text" placeholder="Add a custom name" className="w-full px-3 py-2 border rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <input
              type="text"
              value="BTCUSDT, 1 Crossing Trend Line"
              className="w-full px-3 py-2 border rounded-md mb-2"
              readOnly
            />
            <button className="w-full px-4 py-2 border rounded-md hover:bg-gray-50">Add placeholder</button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Save
          </button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="flex flex-col w-full h-screen bg-[#131722]">
      {/* Header */}
      <div className="p-2 md:p-4 flex items-center justify-between flex-wrap gap-2 border-b border-gray-800">
        <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-jetbrains text-white">BTCUSDT</span>
            <ChevronDown className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-wrap gap-1">
            {["1m", "5m", "15m", "1h", "D"].map((interval) => (
              <button
                key={interval}
                className="px-2 md:px-3 py-1 text-xs md:text-sm hover:bg-gray-700 rounded font-jetbrains text-white"
              >
                {interval}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="flex items-center space-x-1 text-white hover:bg-gray-700 px-2 py-1 rounded">
            <BarChart2 className="w-4 h-4" />
            <span className="hidden md:inline">Indicators</span>
          </button>
          <button
            className="flex items-center space-x-1 text-white hover:bg-gray-700 px-2 py-1 rounded"
            onClick={() => setIsDrawing(!isDrawing)}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="hidden md:inline">Draw Trendline</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
          <ReactApexChart options={chartOptions} series={[{ data: series }]} type="candlestick" height="100%" />
        </motion.div>

        {/* Crosshair */}
        {crosshairPosition && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-px bg-blue-500 opacity-50 h-full" style={{ left: crosshairPosition.x }} />
            <div className="absolute h-px bg-blue-500 opacity-50 w-full" style={{ top: crosshairPosition.y }} />
            <div
              className="absolute bg-blue-500 text-white px-2 py-1 rounded text-xs"
              style={{ left: crosshairPosition.x + 8, top: crosshairPosition.y + 8 }}
            >
              {`X: ${format(new Date(), "HH:mm:ss")}, Y: ${crosshairPosition.y.toFixed(2)}`}
            </div>
          </div>
        )}

        {/* Trendline */}
        {trendLine?.start && (
          <motion.svg
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.line
              x1={trendLine.start.x}
              y1={trendLine.start.y}
              x2={trendLine.end?.x || trendLine.start.x}
              y2={trendLine.end?.y || trendLine.start.y}
              stroke="#1B9CFC"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.svg>
        )}
      </div>

      {/* Modal */}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default ChartComponent

