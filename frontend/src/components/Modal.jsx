import { useState } from "react"
import { motion } from "framer-motion"

const Modal = ({ isOpen, onClose, selectedTrendline }) => {
  const [alertSettings, setAlertSettings] = useState({
    trigger: "Only Once",
    expiration: new Date(),
    name: "",
    message: "",
  })

  const handleSave = () => {
    // Here you can handle saving the alert settings
    // For example, update the trendline in parent component
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-[480px] max-w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit Alert</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trigger</label>
            <select
              className="w-full p-2 border rounded"
              value={alertSettings.trigger}
              onChange={(e) => setAlertSettings((prev) => ({ ...prev, trigger: e.target.value }))}
            >
              <option>Only Once</option>
              <option>Once Per Bar</option>
              <option>Once Per Bar Close</option>
              <option>Once Per Minute</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expiration</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded"
              value={alertSettings.expiration.toISOString().slice(0, 16)}
              onChange={(e) => setAlertSettings((prev) => ({ ...prev, expiration: new Date(e.target.value) }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alert name</label>
            <input
              type="text"
              placeholder="Add a custom name"
              className="w-full p-2 border rounded"
              value={alertSettings.name}
              onChange={(e) => setAlertSettings((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={3}
              value={alertSettings.message}
              onChange={(e) => setAlertSettings((prev) => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            Save
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Modal

