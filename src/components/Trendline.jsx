import PropTypes from "prop-types"

const TrendLine = ({ startPoint, endPoint, onContextMenu }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      <line
        className="trendline"
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        onContextMenu={onContextMenu}
      />
      <circle className="trendline-handle" cx={startPoint.x} cy={startPoint.y} r={4} />
      <circle className="trendline-handle" cx={endPoint.x} cy={endPoint.y} r={4} />
    </svg>
  )
}

TrendLine.propTypes = {
  startPoint: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  endPoint: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onContextMenu: PropTypes.func,
}

export default TrendLine

