'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Clock, CheckCircle, AlertTriangle, Play, Pause } from 'lucide-react'

interface Mission {
  id: string
  name: string
  target: string
  status: 'active' | 'completed' | 'paused' | 'failed'
  progress: number
  phase: string
  vulnerabilities: number
  startTime: string
  estimatedCompletion?: string
}

export default function MissionPanel() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 'mission-001',
      name: 'GitLab CE Analysis',
      target: 'gitlab.com/gitlab-org/gitlab',
      status: 'active',
      progress: 65,
      phase: 'Authentication Analysis',
      vulnerabilities: 2,
      startTime: '14:30:00',
      estimatedCompletion: '15:45:00'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-terminal-green'
      case 'completed':
        return 'text-terminal-blue'
      case 'paused':
        return 'text-terminal-amber'
      case 'failed':
        return 'text-terminal-red'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" />
      case 'completed':
        return <CheckCircle className="h-3 w-3" />
      case 'paused':
        return <Pause className="h-3 w-3" />
      case 'failed':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Target className="h-5 w-5 text-terminal-amber" />
          <span>Active Missions</span>
        </h3>
        <span className="text-sm text-gray-400">{missions.length} running</span>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            className="border border-gray-700 rounded-lg p-4 bg-gray-900/30 terminal-glow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={getStatusColor(mission.status)}>
                  {getStatusIcon(mission.status)}
                </span>
                <h4 className="font-medium">{mission.name}</h4>
              </div>
              <span className="text-xs text-gray-400">{mission.id}</span>
            </div>

            <p className="text-sm text-gray-400 mb-3 font-mono">{mission.target}</p>

            <div className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-terminal-green">{mission.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <motion.div
                    className="bg-terminal-green h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Current Phase */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Current Phase</span>
                <span className="text-xs text-terminal-blue font-medium">
                  {mission.phase}
                </span>
              </div>

              {/* Vulnerabilities Found */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Vulnerabilities Found</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-terminal-amber font-medium">
                    {mission.vulnerabilities}
                  </span>
                  <AlertTriangle className="h-3 w-3 text-terminal-amber" />
                </div>
              </div>

              {/* Timing */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-400">Started: {mission.startTime}</span>
                </div>
                {mission.estimatedCompletion && (
                  <span className="text-gray-400">
                    ETA: {mission.estimatedCompletion}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}