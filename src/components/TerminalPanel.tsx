'use client'

import { useState, useEffect, useRef } from 'react'

interface TerminalLine {
  id: string
  timestamp: string
  type: 'command' | 'output' | 'error' | 'info'
  content: string
}

interface TerminalPanelProps {
  type: 'overseer' | 'hunter'
}

export default function TerminalPanel({ type }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mockOverseerLines: TerminalLine[] = [
      { id: '1', timestamp: '14:32:15', type: 'command', content: '$ hermes deploy hunter --version v16' },
      { id: '2', timestamp: '14:32:15', type: 'output', content: 'Deploying Hunter v16 to Fly.io...' },
      { id: '3', timestamp: '14:32:18', type: 'info', content: '✓ Container built successfully' },
      { id: '4', timestamp: '14:32:22', type: 'info', content: '✓ Hunter v16 deployed and active' },
      { id: '5', timestamp: '14:32:25', type: 'command', content: '$ monitor hunter --real-time' },
      { id: '6', timestamp: '14:32:25', type: 'output', content: 'Monitoring Hunter operations...' },
      { id: '7', timestamp: '14:33:01', type: 'info', content: 'HUNTER: Starting GitLab CE vulnerability scan' },
      { id: '8', timestamp: '14:33:15', type: 'info', content: 'HUNTER: Authentication bypass pattern detected' },
    ]

    const mockHunterLines: TerminalLine[] = [
      { id: '1', timestamp: '14:33:01', type: 'info', content: 'Starting mission: GitLab CE Analysis' },
      { id: '2', timestamp: '14:33:02', type: 'output', content: 'Loading security analysis skills...' },
      { id: '3', timestamp: '14:33:05', type: 'info', content: '✓ OWASP Top 10 patterns loaded' },
      { id: '4', timestamp: '14:33:05', type: 'info', content: '✓ Auth bypass detection active' },
      { id: '5', timestamp: '14:33:08', type: 'output', content: 'Analyzing authentication endpoints...' },
      { id: '6', timestamp: '14:33:15', type: 'command', content: '> scan_auth_bypass --target gitlab-ce' },
      { id: '7', timestamp: '14:33:18', type: 'info', content: '⚠ Potential JWT validation bypass found' },
      { id: '8', timestamp: '14:33:22', type: 'output', content: 'Verifying vulnerability...' },
    ]

    setLines(type === 'overseer' ? mockOverseerLines : mockHunterLines)
  }, [type])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const getLineColor = (lineType: string) => {
    switch (lineType) {
      case 'command':
        return 'text-[rgb(180,180,180)]'
      case 'error':
        return 'text-[rgb(180,50,50)]'
      case 'info':
        return 'text-[rgb(80,140,80)]'
      default:
        return 'text-[rgb(140,140,140)]'
    }
  }

  const getLinePrefix = (lineType: string) => {
    switch (lineType) {
      case 'command':
        return type === 'overseer' ? '$ ' : '> '
      case 'error':
        return '✗ '
      case 'info':
        return '• '
      default:
        return '  '
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-sm bg-[rgb(10,10,12)]"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`flex items-start space-x-2 mb-1 ${getLineColor(line.type)}`}
          >
            <span className="text-[10px] text-[rgb(80,80,80)] w-16 flex-shrink-0 tracking-wider">
              {line.timestamp}
            </span>
            <span className="flex-1 tracking-wide">
              {getLinePrefix(line.type)}{line.content}
            </span>
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-[10px] text-[rgb(80,80,80)] w-16 tracking-wider">
            {new Date().toLocaleTimeString([], { hour12: false })}
          </span>
          <span className="text-[rgb(180,180,180)]">
            {type === 'overseer' ? '$ ' : '> '}
            <span className="cursor-blink">█</span>
          </span>
        </div>
      </div>
    </div>
  )
}
