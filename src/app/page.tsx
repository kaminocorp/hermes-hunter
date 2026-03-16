'use client'

import { useState, useEffect, useRef } from 'react'
import { Terminal, Target, Shield, AlertTriangle, Activity, Database, Cpu, Zap, TrendingUp } from 'lucide-react'
import { useHunterDashboard, useOverseerEvents, useHunterLogs } from '@/hooks/useHunterData'
import { useOverseerDashboard } from '@/hooks/useOverseerData'
import { formatTimestamp } from '@/lib/api'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Hunter data
  const { hunterStatus, metrics, vulnerabilities, logs: hunterLogs, logsConnected } = useHunterDashboard()
  const overseerEvents = useOverseerEvents()
  
  // Combine logs from both sources
  const [allLogs, setAllLogs] = useState<Array<{timestamp: string; type: string; message: string; source: string}>>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Merge and sort logs from both sources
    const merged = [
      ...hunterLogs.map(log => ({ ...log, source: 'HUNTER' })),
      ...overseerEvents.events.map(event => ({
        timestamp: event.timestamp,
        type: event.type || 'info',
        message: event.content,
        source: 'OVERSEER'
      }))
    ].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    
    setAllLogs(merged.slice(-100)) // Keep last 100
  }, [hunterLogs, overseerEvents.events])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allLogs])

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  }

  // Get active mission count from metrics or status
  const activeMissions = metrics?.missions?.active || hunterStatus?.active_missions || 0
  const vulnCount = vulnerabilities?.length || 0

  const cpuUsage = metrics?.system?.workspace_size_mb ? Math.min(metrics.system.workspace_size_mb, 100) : 23
  const memoryUsage = metrics?.performance?.success_rate ? parseInt(metrics.performance.success_rate) || 42 : 42

  return (
    <div className="min-h-screen bg-[rgb(5,5,8)] relative">
      {/* Scanline overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-50" />

      {/* Header - Imperial Command */}
      <header className="header-bg border-header px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-10 w-10 text-[rgb(160,160,160)]" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-[rgb(200,200,200)]">
                Hermes Hunter
              </h1>
              <p className="text-xs tracking-[3px] text-[rgb(100,100,105)] uppercase">
                Vulnerability Discovery Command
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            {/* System Time */}
            <div className="text-right">
              <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase">System Time</div>
              <div className="text-lg font-bold text-[rgb(180,180,180)] tracking-wider">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Status Block */}
            <div className="flex items-center space-x-6">
              <div className="data-block">
                <div className="data-block-label">Overseer</div>
                <div className="data-block-value status-active flex items-center space-x-2">
                  <div className="status-indicator status-active" />
                  <span>ACTIVE</span>
                </div>
              </div>

              <div className="data-block">
                <div className="data-block-label">Hunter</div>
                <div className={`data-block-value flex items-center space-x-2 ${hunterStatus ? 'status-active' : 'status-idle'}`}>
                  <div className={`status-indicator ${hunterStatus ? 'status-active' : 'status-idle'}`} />
                  <span>{hunterStatus ? hunterStatus.status.toUpperCase() : 'OFFLINE'}</span>
                </div>
              </div>

              <div className="data-block">
                <div className="data-block-label">Missions</div>
                <div className="data-block-value text-[rgb(180,180,180)]">
                  {activeMissions.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="data-block">
                <div className="data-block-label">Vulnerabilities</div>
                <div className="data-block-value text-[rgb(180,50,50)]">
                  {vulnCount.toString().padStart(3, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-2 h-[calc(100vh-120px)]">
        {/* Left - Overseer Terminal */}
        <div className="border-r border-[rgb(60,60,65)] flex flex-col">
          <div className="section-header corner-accent flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Terminal className="h-4 w-4" />
              <span>Overseer Terminal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[rgb(80,140,80)]" />
              <span className="text-[10px] tracking-widest">OPERATIONAL</span>
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-sm overflow-auto" ref={scrollRef}>
            <div className="terminal-text space-y-1">
              {allLogs.length === 0 ? (
                <>
                  <div className="terminal-text-highlight">{`[SYSTEM] Hermes Alpha v13.0 initialized`}</div>
                  <div>{`[STATUS] Monitoring Hunter API endpoint...`}</div>
                  <div>{`[TARGET] kaminocorp/hermes-alpha-hunter`}</div>
                  <div>{`[REGION] Singapore (sin)`}</div>
                  <div className="text-[rgb(100,100,105)]">{`Last check: ${formatTime(currentTime)}`}</div>
                  <div className="h-4" />
                  <div className="text-[rgb(100,100,105)]">{`// Awaiting live data stream...`}</div>
                </>
              ) : (
                allLogs.map((log, i) => (
                  <div key={i} className={`${log.source === 'HUNTER' ? 'text-[rgb(80,140,80)]' : 'text-[rgb(180,180,180)]'}`}>
                    <span className="text-[10px] text-[rgb(80,80,80)] mr-2">
                      {log.timestamp.substring(11, 19)}
                    </span>
                    <span className="text-[10px] text-[rgb(100,100,105)] mr-2">[{log.source}]</span>
                    {log.message}
                  </div>
                ))
              )}
              <div className="cursor-blink">█</div>
            </div>
          </div>
        </div>

        {/* Right - Hunter Operations */}
        <div className="flex flex-col">
          <div className="section-header corner-accent flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="h-4 w-4" />
              <span>Hunter Operations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${logsConnected ? 'bg-[rgb(80,140,80)]' : 'bg-[rgb(160,120,60)]'}`} />
              <span className="text-[10px] tracking-widest">
                {logsConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Mission Status */}
            <div className="h-1/2 border-b border-[rgb(60,60,65)] p-4">
              <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase mb-3">Active Missions</div>
              {activeMissions === 0 ? (
                <div className="terminal-text text-[rgb(80,80,80)] italic">
                  No active missions. Awaiting deployment.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Will populate when missions are active */}
                  <div className="text-[rgb(180,180,180)]">Mission active...</div>
                </div>
              )}
            </div>

            {/* Hunter Status */}
            <div className="h-1/2 p-4 font-mono text-sm overflow-auto">
              <div className="terminal-text space-y-2">
                <div className="terminal-text-highlight">{`[HUNTER] API ${metrics?.status || 'STATUS UNKNOWN'}`}</div>
                {metrics && (
                  <>
                    <div>{`[MISSIONS] ${metrics.missions.completed} completed, ${metrics.missions.failed} failed`}</div>
                    <div>{`[SUCCESS RATE] ${metrics.performance.success_rate}`}</div>
                    <div>{`[AVG DURATION] ${metrics.performance.avg_mission_duration}`}</div>
                    <div>{`[WORKSPACE] ${metrics.system.workspace_size_mb} MB`}</div>
                  </>
                )}
                <div className="h-2" />
                <div className={`text-[rgb(80,140,80)]`}>
                  {`[STREAM] ${logsConnected ? 'LIVE' : 'DISCONNECTED'} - receiving telemetry...`}
                </div>
                <div className="cursor-blink">_</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - System Metrics */}
      <footer className="border-t border-[rgb(60,60,65)] bg-[rgb(10,10,12)] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase">System Metrics</div>
          <div className="text-[10px] text-[rgb(80,80,80)] tracking-wider">
            FLY.IO MACHINE: 6837ed3fd4d358
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {/* CPU */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">WORKSPACE</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,180,180)]">{metrics?.system?.workspace_size_mb || '--'} MB</div>
            <div className="progress-container mt-2">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((metrics?.system?.workspace_size_mb || 0) / 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Success Rate */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">SUCCESS RATE</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,180,180)]">{metrics?.performance?.success_rate || '--'}</div>
            <div className="progress-container mt-2">
              <div 
                className="progress-fill" 
                style={{ width: `${parseInt(metrics?.performance?.success_rate || '0') || 0}%` }}
              />
            </div>
          </div>

          {/* Hunter API */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">HUNTER API</span>
            </div>
            <div className={`text-lg font-bold ${hunterStatus ? 'status-active' : 'status-idle'}`}>
              {hunterStatus ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              hermes-alpha-hunter.fly.dev
            </div>
          </div>

          {/* Log Stream */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">LOG STREAM</span>
            </div>
            <div className={`text-lg font-bold ${logsConnected ? 'status-active' : 'status-warning'}`}>
              {logsConnected ? 'LIVE' : 'OFFLINE'}
            </div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              {allLogs.length} entries
            </div>
          </div>

          {/* Vulnerabilities */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">VULNERABILITIES</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,50,50)]">{vulnCount}</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              Total found
            </div>
          </div>

          {/* Alert Status */}
          <div className="data-block border-[rgb(80,80,85)]">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">ALERTS</span>
            </div>
            <div className="text-lg font-bold status-active">CLEAR</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              No anomalies
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
