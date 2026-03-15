'use client'

import { useState, useEffect } from 'react'
import { Terminal, Target, Shield, AlertTriangle, Activity, Database, Cpu, Zap, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hunterApiStatus, setHunterApiStatus] = useState('ONLINE')
  const [activeMissions, setActiveMissions] = useState(0)
  const [vulnerabilitiesFound, setVulnerabilitiesFound] = useState(0)
  const [cpuUsage] = useState(23)
  const [memoryUsage] = useState(42)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
  }

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
                <div className="data-block-value status-idle flex items-center space-x-2">
                  <div className="status-indicator status-idle" />
                  <span>IDLE</span>
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
                  {vulnerabilitiesFound.toString().padStart(3, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-2 h-[calc(100vh-120px)]">
        {/* Left - Overseer Operations */}
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

          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            <div className="terminal-text space-y-1">
              <div className="terminal-text-highlight">{`[SYSTEM] Hermes Alpha v13.0 initialized`}</div>
              <div>{`[STATUS] Monitoring Hunter API endpoint...`}</div>
              <div>{`[TARGET] kaminocorp/hermes-alpha-hunter`}</div>
              <div>{`[REGION] Singapore (sin)`}</div>
              <div className="text-[rgb(100,100,105)]">{`Last check: ${formatTime(currentTime)}`}</div>
              <div className="h-4" />
              <div className="text-[rgb(100,100,105)]">{`// Awaiting mission directives...`}</div>
              <div className="cursor-blink">_</div>
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
              <div className="w-2 h-2 bg-[rgb(80,80,80)]" />
              <span className="text-[10px] tracking-widest">STANDBY</span>
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
                  {/* Mission slots when active */}
                </div>
              )}
            </div>

            {/* Hunter Terminal */}
            <div className="h-1/2 p-4 font-mono text-sm overflow-auto">
              <div className="terminal-text space-y-1">
                <div className="terminal-text-highlight">{`[HUNTER] API v13 ready`}</div>
                <div>{`[TOOLS] web_search, web_extract, terminal, browser`}</div>
                <div className="text-[rgb(100,100,105)]">{`[CONFIG] deepseek/deepseek-v3 (default)`}</div>
                <div className="h-2" />
                <div className="text-[rgb(80,140,80)]">{`[READY] Awaiting mission parameters...`}</div>
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
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">CPU</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,180,180)]">{cpuUsage}%</div>
            <div className="progress-container mt-2">
              <div 
                className="progress-fill" 
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">MEMORY</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,180,180)]">{memoryUsage}%</div>
            <div className="progress-container mt-2">
              <div 
                className="progress-fill" 
                style={{ width: `${memoryUsage}%` }}
              />
            </div>
          </div>

          {/* Hunter API */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">HUNTER API</span>
            </div>
            <div className="text-lg font-bold status-active">{hunterApiStatus}</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              hermes-alpha-hunter.fly.dev
            </div>
          </div>

          {/* Response Time */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">LATENCY</span>
            </div>
            <div className="text-lg font-bold text-[rgb(180,180,180)]">89ms</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              SIN region
            </div>
          </div>

          {/* Analysis Rate */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">THROUGHPUT</span>
            </div>
            <div className="text-lg font-bold text-[rgb(80,80,80)]">--</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              files/min
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
