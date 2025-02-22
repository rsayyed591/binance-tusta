"use client"

import { useState } from "react"

const Modal = ({ onClose, onSend }) => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  const handleXChange = (e) => {
    setX(Number.parseInt(e.target.value))
  }

  const handleYChange = (e) => {
    setY(Number.parseInt(e.target.value))
  }

  const handleSubmit = () => {
    onSend({ x, y })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Enter Coordinates</h3>
          <div className="mt-2 px-7 py-3">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              X Coordinate:
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={x}
                onChange={handleXChange}
              />
            </label>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Y Coordinate:
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={y}
                onChange={handleYChange}
              />
            </label>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              onClick={handleSubmit}
            >
              Send Data
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 mt-2"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal

