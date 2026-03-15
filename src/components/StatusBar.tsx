'use client'

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
        <Activity className="h-4 w-4 text-[rgb(80,140,80)]" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wider">SYSTEM</span>
        <span className="text-xs px-3 py-1 bg-[rgb(80,140,80)]/20 text-[rgb(80,140,80)] tracking-widest">
          OPERATIONAL
        </span>
      </div>

      {/* Active Missions */}
      <div className="flex items-center space-x-2">
        <Target className="h-4 w-4 text-[rgb(180,180,180)]" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wider">MISSIONS</span>
        <span className="text-xs px-3 py-1 bg-[rgb(180,180,180)]/20 text-[rgb(180,180,180)] tracking-widest">
          {activeMissions.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Vulnerabilities Found */}
      <div className="flex items-center space-x-2">
        <Bug className="h-4 w-4 text-[rgb(180,50,50)]" strokeWidth={1.5} />
        <span className="text-sm font-medium tracking-wider">VULNERABILITIES</span>
        <span className="text-xs px-3 py-1 bg-[rgb(180,50,50)]/20 text-[rgb(180,50,50)] tracking-widest">
          {vulnerabilitiesFound.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Uptime */}
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-[rgb(100,100,105)]" strokeWidth={1.5} />
        <span className="text-sm font-medium text-[rgb(100,100,105)] tracking-wider">UPTIME</span>
        <span className="text-xs text-[rgb(100,100,105)] tracking-wider">2h 34m</span>
      </div>
    </div>
  )
}
