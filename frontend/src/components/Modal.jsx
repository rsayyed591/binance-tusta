import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Modal = ({ isOpen, onClose, selectedTrendline }) => {
  const [alertSettings, setAlertSettings] = useState({
    trigger: "Only Once",
    expiration: new Date().toISOString().slice(0, 16),
    name: "",
    message: "",
  })

  const handleInputChange = (key, value) => {
    setAlertSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log("Saved settings: ", alertSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1E222D] rounded-xl shadow-xl border border-[#2A2E39] p-6 w-full max-w-md"
        >
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white/90">Edit Alert</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white/90 focus:outline-none transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </header>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Trigger</label>
              <select
                className="w-full p-2.5 bg-[#131722] border border-[#2A2E39] rounded-lg text-white/90 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={alertSettings.trigger}
                onChange={(e) => handleInputChange("trigger", e.target.value)}
              >
                <option>Only Once</option>
                <option>Once Per Bar</option>
                <option>Once Per Bar Close</option>
                <option>Once Per Minute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Expiration</label>
              <input
                type="datetime-local"
                className="w-full p-2.5 bg-[#131722] border border-[#2A2E39] rounded-lg text-white/90 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={alertSettings.expiration}
                onChange={(e) => handleInputChange("expiration", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Alert Name</label>
              <input
                type="text"
                placeholder="Enter a custom name"
                className="w-full p-2.5 bg-[#131722] border border-[#2A2E39] rounded-lg text-white/90 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={alertSettings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Message</label>
              <textarea
                placeholder="Enter a custom message"
                className="w-full p-2.5 bg-[#131722] border border-[#2A2E39] rounded-lg text-white/90 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                value={alertSettings.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>
          </form>

          <footer className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/80 hover:text-white border border-[#2A2E39] rounded-lg hover:bg-[#2A2E39] focus:ring-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1E222D] transition-all"
            >
              Save
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default Modal

