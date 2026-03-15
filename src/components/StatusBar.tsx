'use client'

import { motion } from 'framer-motion'
import { Activity, Target, Bug, Clock } from 'lucide-react'

interface StatusBarProps {
  overseerStatus: string
  hunterStatus: string
  activeMissions: number
  vulnerabilitiesFound: number
}

export default function StatusBar({ 
  overseerStatus, 
  hunterStatus, 
  activeMissions, 
  vulnerabilitiesFound 
}: StatusBarProps) {
  return (
    <div className="flex items-center space-x-6">
      {/* System Status */}
      <div className="flex items-center space-x-2">
        <Activity className="h-4 w-4 text-terminal-green" />
        <span className="text-sm font-medium">System</span>
        <span className="text-xs px-2 py-1 bg-terminal-green/20 text-terminal-green rounded">
          OPERATIONAL
        </span>
      </div>

      {/* Active Missions */}
      <div className="flex items-center space-x-2">
        <Target className="h-4 w-4 text-terminal-blue" />
        <span className="text-sm font-medium">Missions</span>
        <span className="text-xs px-2 py-1 bg-terminal-blue/20 text-terminal-blue rounded">
          {activeMissions}
        </span>
      </div>

      {/* Vulnerabilities Found */}
      <div className="flex items-center space-x-2">
        <Bug className="h-4 w-4 text-terminal-amber" />
        <span className="text-sm font-medium">Vulnerabilities</span>
        <span className="text-xs px-2 py-1 bg-terminal-amber/20 text-terminal-amber rounded">
          {vulnerabilitiesFound}
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">Uptime</span>
        <span className="text-xs text-gray-400">2h 34m</span>
      </div>
    </div>
  )
}