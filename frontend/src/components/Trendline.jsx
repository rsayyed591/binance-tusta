import { useEffect, useRef, useState, useCallback } from "react"
import { format } from "date-fns"
import { throttle } from "lodash"
import { sendTrendlineCoordinates } from "../utils/api"

const Trendline = ({ chartRef, series, onTrendlineSelect }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [trendlines, setTrendlines] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, xValue: null, yValue: null })
  const [crosshairPosition, setCrosshairPosition] = useState({ x: 0, y: 0 })

  const svgRef = useRef(null)
  const drawingRef = useRef({ start: null, end: null })
  const chartBoundsRef = useRef(null)

  // Load saved trendlines
  useEffect(() => {
    const savedTrendlines = localStorage.getItem("chartTrendlines")
    if (savedTrendlines) {
      setTrendlines(JSON.parse(savedTrendlines))
    }
  }, [])

  // Save trendlines
  useEffect(() => {
    localStorage.setItem("chartTrendlines", JSON.stringify(trendlines))
  }, [trendlines])

  // Update chart bounds on resize
  useEffect(() => {
    if (!chartRef.current) return

    const updateBounds = () => {
      const chartArea = chartRef.current.querySelector(".apexcharts-inner")
      if (chartArea) {
        chartBoundsRef.current = chartArea.getBoundingClientRect()
      }
    }

    updateBounds()
    window.addEventListener("resize", updateBounds)

    return () => window.removeEventListener("resize", updateBounds)
  }, [chartRef])

  const getChartCoordinates = useCallback(
    (clientX, clientY) => {
      if (!chartBoundsRef.current || !series.length) return null

      const { left, top, width, height } = chartBoundsRef.current
      const x = clientX - left
      const y = clientY - top

      if (x < 0 || x > width || y < 0 || y > height) return null

      const xRange = series[series.length - 1].x - series[0].x
      const yMin = Math.min(...series.map((d) => d.y[2]))
      const yMax = Math.max(...series.map((d) => d.y[1]))
      const yRange = yMax - yMin

      const xValue = new Date(series[0].x.getTime() + (x / width) * xRange)
      const yValue = yMax - (y / height) * yRange

      return { x, y, xValue, yValue }
    },
    [series],
  )

  const handleMouseMove = useCallback(
    throttle((event) => {
      if (!svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      setCrosshairPosition({ x: mouseX, y: mouseY })

      const coords = getChartCoordinates(event.clientX, event.clientY)
      if (coords) {
        setMousePosition(coords)
        if (isDrawing && drawingRef.current.start) {
          drawingRef.current.end = { x: mouseX, y: mouseY }
          updateDrawingLine()
        }
      }
    }, 16),
    [getChartCoordinates, isDrawing],
  )

  const updateDrawingLine = () => {
    const svg = svgRef.current
    if (!svg || !drawingRef.current.start) return

    let line = svg.querySelector("#drawingLine")
    if (!line) {
      line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.id = "drawingLine"
      svg.appendChild(line)
    }

    const { start, end } = drawingRef.current
    line.setAttribute("x1", start.x.toString())
    line.setAttribute("y1", start.y.toString())
    line.setAttribute("x2", (end?.x || start.x).toString())
    line.setAttribute("y2", (end?.y || start.y).toString())
    line.setAttribute("stroke", "#1B9CFC")
    line.setAttribute("stroke-width", "2")
  }

  const handleMouseDown = useCallback(
    (event) => {
      if (event.button !== 0) return

      setIsDrawing(true)
      drawingRef.current.start = {
        x: crosshairPosition.x,
        y: crosshairPosition.y,
        xValue: mousePosition.xValue,
        yValue: mousePosition.yValue,
      }
    },
    [crosshairPosition, mousePosition],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawingRef.current.start || !drawingRef.current.end) {
      setIsDrawing(false)
      return
    }

    const { start, end } = drawingRef.current
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 20) {
      const newTrendline = {
        id: Date.now(),
        start: { ...start },
        end: { ...end },
      }

      setTrendlines((prev) => [...prev, newTrendline])
      sendTrendlineCoordinates(newTrendline).catch(console.error)
    }

    const drawingLine = svgRef.current.querySelector("#drawingLine")
    if (drawingLine) drawingLine.remove()

    drawingRef.current = { start: null, end: null }
    setIsDrawing(false)
  }, [isDrawing])

  const handleTrendlineRightClick = useCallback(
    (event, trendline) => {
      event.preventDefault()
      onTrendlineSelect(trendline)
    },
    [onTrendlineSelect],
  )

  return (
    <>
      {/* Price values following crosshair */}
      {mousePosition.yValue && (
        <>
          {/* Y-axis value (left side) */}
          <div
            className="absolute bg-black text-white text-sm px-2 py-1 rounded flex items-center gap-1 pointer-events-none"
            style={{
              left: 8,
              top: crosshairPosition.y - 12,
              zIndex: 50,
              transform: "translateY(-50%)",
            }}
          >
            <span className="text-lg">+</span>
            {mousePosition.yValue.toFixed(2)}
          </div>

          {/* X-axis value (bottom) */}
          <div
            className="absolute bg-black text-white text-sm px-2 py-1 rounded pointer-events-none"
            style={{
              left: crosshairPosition.x,
              bottom: 8,
              zIndex: 50,
              transform: "translateX(-50%)",
            }}
          >
            {format(mousePosition.xValue, "dd MMM")}
          </div>
        </>
      )}

      {/* Keep the rest of the component unchanged */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {crosshairPosition && (
          <>
            <line
              x1={0}
              y1={crosshairPosition.y}
              x2="100%"
              y2={crosshairPosition.y}
              stroke="#888"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1={crosshairPosition.x}
              y1={0}
              x2={crosshairPosition.x}
              y2="100%"
              stroke="#888"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </>
        )}

        {trendlines.map((trendline) => (
          <g key={trendline.id} onContextMenu={(e) => handleTrendlineRightClick(e, trendline)}>
            <line
              x1={trendline.start.x}
              y1={trendline.start.y}
              x2={trendline.end.x}
              y2={trendline.end.y}
              stroke="#1B9CFC"
              strokeWidth="2"
            />
            <line
              x1={trendline.start.x}
              y1={trendline.start.y}
              x2={trendline.end.x}
              y2={trendline.end.y}
              stroke="transparent"
              strokeWidth="10"
              style={{ cursor: "context-menu" }}
            />
          </g>
        ))}
      </svg>

      {!isDrawing && trendlines.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded">
          Click and drag to draw a trendline
        </div>
      )}
    </>
  )
}

export default Trendline

