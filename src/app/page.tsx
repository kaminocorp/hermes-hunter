'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Activity, Target, Shield, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import StatusBar from '@/components/StatusBar'
import TerminalPanel from '@/components/TerminalPanel'
import MissionPanel from '@/components/MissionPanel'
import SystemMetrics from '@/components/SystemMetrics'

export default function Dashboard() {
  const [overseerStatus, setOverseerStatus] = useState('active')
  const [hunterStatus, setHunterStatus] = useState('idle')
  const [activeMissions, setActiveMissions] = useState(0)
  const [vulnerabilitiesFound, setVulnerabilitiesFound] = useState(12)

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Header */}
      <motion.header 
        className="border-b border-gray-800 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-hermes-primary" />
            <div>
              <h1 className="text-xl font-semibold">Hermes Hunter</h1>
              <p className="text-sm text-gray-400">Bug Bounty Operations Dashboard</p>
            </div>
          </div>
          <StatusBar 
            overseerStatus={overseerStatus}
            hunterStatus={hunterStatus}
            activeMissions={activeMissions}
            vulnerabilitiesFound={vulnerabilitiesFound}
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Panel - Overseer */}
        <motion.div 
          className="w-1/2 border-r border-gray-800 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="border-b border-gray-800 px-4 py-3 bg-gray-900/30">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-hermes-primary" />
              <span className="font-medium">Overseer Terminal</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-terminal-green rounded-full status-pulse"></div>
                <span className="text-xs text-gray-400">ACTIVE</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <TerminalPanel type="overseer" />
          </div>
        </motion.div>

        {/* Right Panel - Hunter */}
        <motion.div 
          className="w-1/2 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b border-gray-800 px-4 py-3 bg-gray-900/30">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-terminal-amber" />
              <span className="font-medium">Hunter Operations</span>
              <div className="flex items-center space-x-1 ml-auto">
                <div className="w-2 h-2 bg-terminal-amber rounded-full"></div>
                <span className="text-xs text-gray-400">SCANNING</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-1/2 border-b border-gray-800">
              <MissionPanel />
            </div>
            <div className="h-1/2 overflow-hidden">
              <TerminalPanel type="hunter" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Panel - System Metrics */}
      <motion.div 
        className="border-t border-gray-800 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SystemMetrics />
      </motion.div>
    </div>
  )
}