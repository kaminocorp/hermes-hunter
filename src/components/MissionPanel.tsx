'use client'

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
  const missions: Mission[] = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-[rgb(80,140,80)]'
      case 'completed':
        return 'text-[rgb(180,180,180)]'
      case 'paused':
        return 'text-[rgb(160,120,60)]'
      case 'failed':
        return 'text-[rgb(180,50,50)]'
      default:
        return 'text-[rgb(100,100,105)]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" strokeWidth={1.5} />
      case 'completed':
        return <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
      case 'paused':
        return <Pause className="h-3 w-3" strokeWidth={1.5} />
      case 'failed':
        return <AlertTriangle className="h-3 w-3" strokeWidth={1.5} />
      default:
        return <Clock className="h-3 w-3" strokeWidth={1.5} />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'active':
        return '[rgb(80,140,80)]'
      case 'completed':
        return '[rgb(180,180,180)]'
      case 'paused':
        return '[rgb(160,120,60)]'
      case 'failed':
        return '[rgb(180,50,50)]'
      default:
        return '[rgb(100,100,105)]'
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-widest uppercase flex items-center space-x-2 text-[rgb(160,160,160)]">
          <Target className="h-4 w-4" strokeWidth={1.5} />
          <span>Active Missions</span>
        </h3>
        <span className="text-xs text-[rgb(100,100,105)] tracking-wider">{missions.length} RUNNING</span>
      </div>

      <div className="space-y-4">
        {missions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[rgb(80,80,80)] text-sm tracking-wider mb-2">NO ACTIVE MISSIONS</div>
              <div className="text-[rgb(60,60,60)] text-xs tracking-widest">AWAITING DEPLOYMENT ORDERS</div>
            </div>
          </div>
        ) : (
          missions.map((mission) => (
            <div
              key={mission.id}
              className="border border-[rgb(60,60,65)] p-4 bg-[rgb(10,10,12)]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(mission.status)}>
                    {getStatusIcon(mission.status)}
                  </span>
                  <h4 className="font-medium tracking-wide text-[rgb(180,180,180)]">{mission.name}</h4>
                </div>
                <span className="text-[10px] text-[rgb(100,100,105)] tracking-wider font-mono">{mission.id}</span>
              </div>

              <p className="text-xs text-[rgb(100,100,105)] mb-3 font-mono tracking-wide">{mission.target}</p>

              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[rgb(100,100,105)] tracking-wider">PROGRESS</span>
                    <span className={`text-xs font-bold tracking-wider ${getStatusColor(mission.status)}`}>
                      {mission.progress}%
                    </span>
                  </div>
                  <div className="progress-container">
                    <div
                      className={`progress-fill ${getProgressColor(mission.status).replace('bg-', '')}`}
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>

                {/* Current Phase */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[rgb(100,100,105)] tracking-wider">CURRENT PHASE</span>
                  <span className="text-[10px] text-[rgb(180,180,180)] font-medium tracking-wider">
                    {mission.phase}
                  </span>
                </div>

                {/* Vulnerabilities Found */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[rgb(100,100,105)] tracking-wider">VULNERABILITIES</span>
                  <div className="flex items-center space-x-1">
                    <span className={`text-[10px] font-bold tracking-wider ${getStatusColor(mission.status)}`}>
                      {mission.vulnerabilities}
                    </span>
                    <AlertTriangle className="h-3 w-3 text-[rgb(160,120,60)]" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Timing */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-[rgb(100,100,105)]" strokeWidth={1.5} />
                    <span className="text-[rgb(100,100,105)] tracking-wider">START: {mission.startTime}</span>
                  </div>
                  {mission.estimatedCompletion && (
                    <span className="text-[rgb(100,100,105)] tracking-wider">
                      ETA: {mission.estimatedCompletion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
