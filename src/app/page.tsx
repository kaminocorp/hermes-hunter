'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Terminal, Target, AlertTriangle, Activity, Database, Cpu, Zap, TrendingUp, FileText, Shield, AlertCircle, Info, ChevronRight, X, Download } from 'lucide-react'
import HermesIcon from '@/components/HermesIcon'
import { useHunterDashboard, useHunterLogs } from '@/hooks/useHunterData'
import { useOverseerDashboard, useOverseerEvents } from '@/hooks/useOverseerData'
import { formatTimestamp, fetchVulnerability, type VulnerabilityReport } from '@/lib/api'

// Severity config for modal
const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: 'text-[rgb(220,60,60)]', bg: 'bg-[rgb(220,60,60)]', border: 'border-[rgb(220,60,60)]' },
  HIGH: { color: 'text-[rgb(220,120,60)]', bg: 'bg-[rgb(220,120,60)]', border: 'border-[rgb(220,120,60)]' },
  MEDIUM: { color: 'text-[rgb(220,180,60)]', bg: 'bg-[rgb(220,180,60)]', border: 'border-[rgb(220,180,60)]' },
  LOW: { color: 'text-[rgb(100,140,180)]', bg: 'bg-[rgb(100,140,180)]', border: 'border-[rgb(100,140,180)]' },
}

function extractSeverity(content: string): string {
  const match = content.match(/### Severity:\s*(\w+)/i)
  return match ? match[1].toUpperCase() : 'MEDIUM'
}

function extractCVSS(content: string): string {
  const match = content.match(/### CVSS Score:\s*([\d.]+)\s*\(([^)]+)\)/i)
  return match ? `${match[1]} (${match[2]})` : ''
}

function renderMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: any[] = []
  let inCodeBlock = false
  let codeContent: string[] = []

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-[rgb(10,10,15)] border border-[rgb(40,40,45)] rounded-sm p-4 overflow-x-auto my-4">
            <code className="text-[11px] font-mono text-[rgb(180,180,180)]">{codeContent.join('\n')}</code>
          </pre>
        )
        codeContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      return
    }
    if (inCodeBlock) { codeContent.push(line); return }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-[13px] font-bold text-[rgb(200,200,200)] uppercase tracking-widest mt-8 mb-3 border-b border-[rgb(40,40,45)] pb-2">{line.replace('### ', '')}</h3>)
      return
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-[15px] font-bold text-[rgb(220,220,220)] uppercase tracking-wider mt-6 mb-3">{line.replace('## ', '')}</h2>)
      return
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-[18px] font-bold text-[rgb(220,220,220)] uppercase tracking-widest mb-6">{line.replace('# ', '')}</h1>)
      return
    }
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="flex items-start space-x-2 text-[13px] text-[rgb(160,160,160)] font-mono my-1 ml-4">
          <span className="text-[rgb(80,80,85)] mt-1">●</span>
          <span dangerouslySetInnerHTML={{ __html: line.trim().substring(2).replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(200,200,200)]">$1</strong>') }} />
        </div>
      )
      return
    }
    if (line.trim() === '') { elements.push(<div key={i} className="h-4" />); return }

    elements.push(
      <p key={i} className="text-[13px] text-[rgb(160,160,160)] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(200,200,200)]">$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-[rgb(30,30,35)] px-1 rounded text-[rgb(180,180,180)]">$1</code>') }} />
    )
  })
  return elements
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Fix hydration mismatch - wait for client mount
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Hunter data
  const { hunterStatus, metrics, vulnerabilities, logs: hunterLogs, logsConnected } = useHunterDashboard()
  const overseerEvents = useOverseerEvents()
  
  // Report modal state
  const [modalReport, setModalReport] = useState<VulnerabilityReport | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  const openReport = useCallback((vulnId: string) => {
    setModalLoading(true)
    setModalReport(null)
    fetchVulnerability(vulnId)
      .then(setModalReport)
      .catch((err) => console.error('Failed to load report:', err))
      .finally(() => setModalLoading(false))
  }, [])

  const closeModal = useCallback(() => {
    setModalReport(null)
    setModalLoading(false)
  }, [])

  const downloadPdf = useCallback(() => {
    if (!modalReport) return
    const severity = extractSeverity(modalReport.content)
    const cfg = severityConfig[severity] || severityConfig.MEDIUM
    const cvss = extractCVSS(modalReport.content)

    // Build styled HTML document for print
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Vulnerability Report</title>
<style>
  body { font-family: 'Courier New', monospace; color: #222; max-width: 720px; margin: 40px auto; padding: 0 20px; font-size: 13px; line-height: 1.7; }
  h1 { font-size: 20px; text-transform: uppercase; letter-spacing: 3px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin-top: 28px; }
  h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  pre { background: #f4f4f4; border: 1px solid #ddd; padding: 12px; overflow-x: auto; font-size: 11px; border-radius: 2px; }
  code { background: #f0f0f0; padding: 1px 4px; border-radius: 2px; font-size: 12px; }
  .meta { display: flex; gap: 16px; margin-bottom: 24px; font-size: 11px; color: #666; }
  .badge { padding: 2px 8px; border: 1px solid; font-weight: bold; font-size: 10px; letter-spacing: 2px; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="meta">
  <span class="badge" style="border-color: ${severity === 'CRITICAL' ? '#dc3c3c' : severity === 'HIGH' ? '#dc783c' : severity === 'MEDIUM' ? '#dcb43c' : '#648cb4'}; color: ${severity === 'CRITICAL' ? '#dc3c3c' : severity === 'HIGH' ? '#dc783c' : severity === 'MEDIUM' ? '#dcb43c' : '#648cb4'}">${severity}</span>
  ${cvss ? `<span>CVSS: ${cvss}</span>` : ''}
  <span>Discovered: ${new Date(modalReport.discovered_at).toLocaleString()}</span>
</div>
${modalReport.content
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/^- (.+)$/gm, '<li>$1</li>')
  .replace(/(<li>.*<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>')
  .replace(/```\\w*\n([\s\S]*?)```/g, '<pre>$1</pre>')
  .replace(/\n\n/g, '<br><br>')
}
<hr style="margin-top:40px;border:none;border-top:1px solid #ccc">
<div style="font-size:9px;color:#999;margin-top:8px">Generated by Hermes Hunter — ${new Date().toISOString()}</div>
</body></html>`

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }, [modalReport])

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeModal])

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
    <div className="h-screen bg-[rgb(5,5,8)] relative flex flex-col">
      {/* Scanline overlay */}
      <div className="scanlines fixed inset-0 pointer-events-none z-50" />

      {/* Header - Imperial Command */}
      <header className="header-bg border-header px-4 py-4 md:px-6 md:py-8 relative overflow-hidden min-h-[100px] md:min-h-[140px] shrink-0">
        {/* Hero angel image */}
        <div className="hero-image-container">
          <picture>
            <source srcSet="/images/hermes-angel.avif" type="image/avif" />
            <source srcSet="/images/hermes-angel.webp" type="image/webp" />
            <img
              src="/images/hermes-angel.png"
              alt=""
              className="hero-image"
              loading="eager"
            />
          </picture>
          <div className="hero-overlay" />
        </div>

        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <HermesIcon size={40} className="text-[rgb(200,200,200)]" />
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold tracking-widest uppercase text-[rgb(220,220,220)]">
                Hermes Hunter
              </h1>
              <p className="font-display text-xs tracking-[3px] text-[rgb(140,140,145)] uppercase hidden md:block">
                Vulnerability Discovery Command
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-0 md:space-x-8">
            {/* System Time */}
            <div className="text-right hidden md:block">
              <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase">System Time</div>
              <div className="text-lg font-bold text-[rgb(180,180,180)] tracking-wider">
                {mounted && currentTime ? formatTime(currentTime) : '--:--:--'}
              </div>
            </div>

            {/* Status Block */}
            <div className="flex flex-wrap items-center gap-2 md:gap-0 md:space-x-6">
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
                <Link href="/reports" className="data-block-value text-[rgb(180,50,50)] hover:text-[rgb(220,80,80)] transition-colors cursor-pointer">
                  {vulnCount.toString().padStart(3, '0')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col md:grid md:grid-cols-2 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
        {/* Left - Overseer Terminal */}
        <div className="border-b md:border-b-0 md:border-r border-[rgb(60,60,65)] flex flex-col min-h-[300px] md:min-h-0">
          <div className="section-header corner-accent flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Terminal className="h-4 w-4" />
              <span>Overseer Terminal</span>
            </div>
            <Link
              href="/reports"
              className="flex items-center space-x-2 text-[10px] tracking-widest text-[rgb(100,100,105)] hover:text-[rgb(180,180,180)] transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>REPORTS</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[rgb(80,140,80)]" />
              <span className="text-[10px] tracking-widest">OPERATIONAL</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-4 font-mono text-sm overflow-y-auto" ref={scrollRef}>
            <div className="terminal-text space-y-1">
              {allLogs.length === 0 ? (
                <>
                  <div className="terminal-text-highlight">{`[SYSTEM] Hermes Alpha v13.0 initialized`}</div>
                  <div>{`[STATUS] Monitoring Hunter API endpoint...`}</div>
                  <div>{`[TARGET] kaminocorp/hermes-alpha-hunter`}</div>
                  <div>{`[REGION] Singapore (sin)`}</div>
                  <div className="text-[rgb(100,100,105)]">{`Last check: ${mounted && currentTime ? formatTime(currentTime) : '------'}`}</div>
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
        <div className="flex flex-col min-h-[300px] md:min-h-0">
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

          <div className="flex-1 min-h-0 flex flex-col">
            {/* Vulnerability Feed */}
            <div className="h-1/2 min-h-0 border-b border-[rgb(60,60,65)] flex flex-col">
              <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase">Recent Reports</div>
                <Link
                  href="/reports"
                  className="flex items-center space-x-1 text-[10px] tracking-widest text-[rgb(100,100,105)] hover:text-[rgb(180,180,180)] transition-colors"
                >
                  <span>VIEW ALL</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
                {vulnCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Shield className="w-8 h-8 text-[rgb(40,40,45)] mb-2" />
                    <div className="terminal-text text-[rgb(80,80,80)] italic text-xs">
                      No vulnerabilities discovered yet
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {vulnerabilities?.slice(0, 8).map((vuln, i) => {
                      const severityMatch = vuln.preview.match(/### Severity:\s*(\w+)/i)
                      const severity = severityMatch ? severityMatch[1].toUpperCase() : 'MEDIUM'
                      const severityColors: Record<string, string> = {
                        CRITICAL: 'bg-[rgb(220,60,60)]',
                        HIGH: 'bg-[rgb(220,120,60)]',
                        MEDIUM: 'bg-[rgb(220,180,60)]',
                        LOW: 'bg-[rgb(100,140,180)]',
                      }
                      const severityText: Record<string, string> = {
                        CRITICAL: 'text-[rgb(220,60,60)]',
                        HIGH: 'text-[rgb(220,120,60)]',
                        MEDIUM: 'text-[rgb(220,180,60)]',
                        LOW: 'text-[rgb(100,140,180)]',
                      }
                      const title = vuln.preview.split('\n')[0]?.replace(/^#.*?:\s*/, '') || `Vuln ${vuln.id}`

                      return (
                        <button
                          key={vuln.id}
                          onClick={() => openReport(vuln.id)}
                          className="group flex items-center space-x-3 py-2 px-2 rounded-sm hover:bg-[rgb(15,15,20)] transition-colors w-full text-left"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityColors[severity] || severityColors.MEDIUM}`} />
                          <span className={`text-[9px] font-bold tracking-wider w-14 shrink-0 ${severityText[severity] || severityText.MEDIUM}`}>
                            {severity.substring(0, 4)}
                          </span>
                          <span className="text-[11px] font-mono text-[rgb(140,140,145)] group-hover:text-[rgb(200,200,200)] transition-colors truncate">
                            {title}
                          </span>
                          <span className="text-[9px] text-[rgb(60,60,65)] font-mono ml-auto shrink-0">
                            {new Date(vuln.discovered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </button>
                      )
                    })}
                    {vulnCount > 8 && (
                      <Link
                        href="/reports"
                        className="block text-center text-[10px] text-[rgb(80,80,85)] hover:text-[rgb(140,140,145)] transition-colors py-1 tracking-widest"
                      >
                        +{vulnCount - 8} MORE
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hunter Status */}
            <div className="h-1/2 min-h-0 p-4 font-mono text-sm overflow-y-auto">
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
      <footer className="border-t border-[rgb(60,60,65)] bg-[rgb(10,10,12)] px-3 py-3 md:px-6 md:py-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[rgb(100,100,105)] tracking-widest uppercase">System Metrics</div>
          <div className="text-[10px] text-[rgb(80,80,80)] tracking-wider">
            FLY.IO MACHINE: 6837ed3fd4d358
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
          {/* CPU */}
          <div className="data-block">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="h-3 w-3 text-[rgb(100,100,105)]" />
              <span className="text-xs text-[rgb(100,100,105)] tracking-wider">WORKSPACE</span>
            </div>
            <div className="text-base md:text-lg font-bold text-[rgb(180,180,180)]">{metrics?.system?.workspace_size_mb || '--'} MB</div>
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
            <div className="text-base md:text-lg font-bold text-[rgb(180,180,180)]">{metrics?.performance?.success_rate || '--'}</div>
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
            <div className={`text-base md:text-lg font-bold ${hunterStatus ? 'status-active' : 'status-idle'}`}>
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
            <div className={`text-base md:text-lg font-bold ${logsConnected ? 'status-active' : 'status-warning'}`}>
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
            <div className="text-base md:text-lg font-bold text-[rgb(180,50,50)]">{vulnCount}</div>
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
            <div className="text-base md:text-lg font-bold status-active">CLEAR</div>
            <div className="text-[10px] text-[rgb(100,100,105)] mt-1">
              No anomalies
            </div>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      {(modalReport || modalLoading) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 flex flex-col bg-[rgb(8,8,12)] border border-[rgb(50,50,55)] rounded-sm shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[rgb(40,40,45)] shrink-0">
              <div className="flex flex-wrap items-center gap-2 md:gap-0 md:space-x-4">
                <Shield className="w-4 h-4 text-[rgb(100,100,105)]" />
                <span className="text-xs font-bold text-[rgb(160,160,165)] uppercase tracking-widest">
                  Vulnerability Report
                </span>
                {modalReport && (() => {
                  const sev = extractSeverity(modalReport.content)
                  const cfg = severityConfig[sev] || severityConfig.MEDIUM
                  return (
                    <div className={`px-2 py-0.5 ${cfg.bg} bg-opacity-10 border ${cfg.border} rounded-sm`}>
                      <span className={`text-[9px] font-bold tracking-widest ${cfg.color}`}>{sev}</span>
                    </div>
                  )
                })()}
                {modalReport && (() => {
                  const cvss = extractCVSS(modalReport.content)
                  return cvss ? (
                    <div className="px-2 py-0.5 bg-[rgb(20,20,25)] border border-[rgb(40,40,45)] rounded-sm">
                      <span className="text-[9px] font-mono text-[rgb(120,120,125)]">CVSS: {cvss}</span>
                    </div>
                  ) : null
                })()}
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-[rgb(80,80,85)] hover:text-[rgb(180,180,180)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-[rgb(100,100,105)] font-mono text-sm animate-pulse">
                    Loading report...
                  </div>
                </div>
              ) : modalReport ? (
                <div className="max-w-none pb-8">
                  {renderMarkdown(modalReport.content)}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 border-t border-[rgb(40,40,45)] shrink-0">
              <span className="text-[9px] text-[rgb(60,60,65)] font-mono tracking-wider">
                {modalReport ? new Date(modalReport.discovered_at).toLocaleString() : ''}
              </span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={downloadPdf}
                  disabled={!modalReport}
                  className="flex items-center space-x-1.5 text-[10px] text-[rgb(80,80,85)] hover:text-[rgb(140,140,145)] disabled:opacity-30 transition-colors tracking-widest"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT PDF</span>
                </button>
                <Link
                  href="/reports"
                  className="text-[10px] text-[rgb(80,80,85)] hover:text-[rgb(140,140,145)] transition-colors tracking-widest"
                >
                  OPEN IN FULL VIEW
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
