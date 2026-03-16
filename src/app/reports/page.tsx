'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, AlertCircle, Info, FileText, ExternalLink, Code, Bug, Lock, Database, Eye } from 'lucide-react'
import { fetchVulnerabilities, fetchVulnerability, type Vulnerability, type VulnerabilityReport } from '@/lib/api'

// Severity configuration
const severityConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  CRITICAL: {
    color: 'text-[rgb(220,60,60)]',
    bg: 'bg-[rgb(220,60,60)]',
    border: 'border-[rgb(220,60,60)]',
    icon: AlertTriangle,
  },
  HIGH: {
    color: 'text-[rgb(220,120,60)]',
    bg: 'bg-[rgb(220,120,60)]',
    border: 'border-[rgb(220,120,60)]',
    icon: AlertCircle,
  },
  MEDIUM: {
    color: 'text-[rgb(220,180,60)]',
    bg: 'bg-[rgb(220,180,60)]',
    border: 'border-[rgb(220,180,60)]',
    icon: Info,
  },
  LOW: {
    color: 'text-[rgb(100,140,180)]',
    bg: 'bg-[rgb(100,140,180)]',
    border: 'border-[rgb(100,140,180)]',
    icon: Info,
  },
}

const vulnTypeIcons: Record<string, any> = {
  'SQL': Database,
  'XSS': Code,
  'IDOR': Lock,
  'Injection': Bug,
  'RCE': AlertTriangle,
  'SSTI': Code,
  'NoSQL': Database,
  'Code': Code,
  'Auth': Lock,
  'Information': Eye,
  'JWT': Lock,
  'Open Redirect': ExternalLink,
}

function getVulnTypeIcon(title: string) {
  for (const [key, Icon] of Object.entries(vulnTypeIcons)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return Icon
    }
  }
  return FileText
}

function extractSeverity(content: string): string {
  const match = content.match(/### Severity:\s*(\w+)/i)
  return match ? match[1].toUpperCase() : 'MEDIUM'
}

function extractCVSS(content: string): string {
  const match = content.match(/### CVSS Score:\s*([\d.]+)\s*\(([^)]+)\)/i)
  return match ? `${match[1]} (${match[2]})` : ''
}

function extractLocation(content: string): string {
  const match = content.match(/### Location[\s\S]*?- \*\*File\*\*:\s*`([^`]+)`/)
  return match ? match[1] : 'Unknown'
}

function extractDescription(content: string): string {
  const match = content.match(/### Description[\s\S]*?(?=###|$)/i)
  if (match) {
    let desc = match[0].replace('### Description', '').trim()
    return desc.length > 200 ? desc.substring(0, 200) + '...' : desc
  }
  return ''
}

// Vulnerability List Component
function VulnerabilityList({ onSelect }: { onSelect: (vuln: Vulnerability) => void }) {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVulnerabilities()
      .then((data) => {
        setVulnerabilities(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[rgb(100,100,105)] font-mono text-sm animate-pulse">
          Loading vulnerability reports...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[rgb(220,60,60)] font-mono text-sm">
          Error: {error}
        </div>
      </div>
    )
  }

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[rgb(100,100,105)] font-mono text-sm text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <div>No vulnerabilities discovered yet</div>
          <div className="text-[10px] mt-2">Missions in progress will populate this list</div>
        </div>
      </div>
    )
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  const sorted = [...vulnerabilities].sort((a, b) => {
    const aSeverity = extractSeverity(a.preview).split(' ')[0]
    const bSeverity = extractSeverity(b.preview).split(' ')[0]
    return (severityOrder[aSeverity] || 2) - (severityOrder[bSeverity] || 2)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {sorted.map((vuln) => {
        const severity = extractSeverity(vuln.preview)
        const config = severityConfig[severity] || severityConfig.MEDIUM
        const Icon = config.icon
        const TypeIcon = getVulnTypeIcon(vuln.preview)

        return (
          <button
            key={vuln.id}
            onClick={() => onSelect(vuln)}
            className="group relative flex flex-col items-start p-5 bg-[rgb(15,15,20)] border border-[rgb(40,40,45)] rounded-sm hover:border-[rgb(80,80,90)] transition-all duration-200 text-left"
          >
            {/* Severity indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${config.bg} rounded-l-sm opacity-80`} />
            
            {/* Header */}
            <div className="flex items-start justify-between w-full mb-3 pl-3">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-[10px] font-bold tracking-widest ${config.color}`}>{severity}</span>
              </div>
              <TypeIcon className="w-4 h-4 text-[rgb(80,80,85)] group-hover:text-[rgb(120,120,125)] transition-colors" />
            </div>

            {/* Title */}
            <h3 className="font-mono text-sm text-[rgb(180,180,180)] group-hover:text-[rgb(220,220,220)] transition-colors pl-3 mb-2 line-clamp-2">
              {vuln.preview.split('\n')[0]?.replace(/^#.*?:\s*/, '') || `Vulnerability ${vuln.id}`}
            </h3>

            {/* Location */}
            <div className="flex items-center space-x-2 pl-3 mb-3">
              <FileText className="w-3 h-3 text-[rgb(80,80,85)]" />
              <span className="text-[10px] text-[rgb(100,100,105)] font-mono truncate max-w-[200px]">
                {extractLocation(vuln.preview)}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between w-full pl-3 mt-auto pt-3 border-t border-[rgb(30,30,35)]">
              <span className="text-[9px] text-[rgb(80,80,85)] font-mono">
                {new Date(vuln.discovered_at).toLocaleDateString()}
              </span>
              <span className="text-[9px] text-[rgb(120,120,125)] group-hover:translate-x-1 transition-transform">
                View Report →
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Vulnerability Detail Component
function VulnerabilityDetail({ vulnId, onBack }: { vulnId: string; onBack: () => void }) {
  const [report, setReport] = useState<VulnerabilityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVulnerability(vulnId)
      .then((data) => {
        setReport(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [vulnId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[rgb(100,100,105)] font-mono text-sm animate-pulse">
          Loading report...
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[rgb(100,100,105)] hover:text-[rgb(180,180,180)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">Back to Reports</span>
        </button>
        <div className="text-[rgb(220,60,60)] font-mono text-sm">
          Error loading report: {error || 'Report not found'}
        </div>
      </div>
    )
  }

  const severity = extractSeverity(report.content)
  const config = severityConfig[severity] || severityConfig.MEDIUM
  const cvss = extractCVSS(report.content)
  const location = extractLocation(report.content)
  const description = extractDescription(report.content)

  // Simple markdown renderer
  function renderMarkdown(content: string) {
    const lines = content.split('\n')
    const elements: any[] = []
    let inCodeBlock = false
    let codeLang = ''
    let codeContent: string[] = []
    let inList = false

    lines.forEach((line, i) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={i} className="bg-[rgb(10,10,15)] border border-[rgb(40,40,45)] rounded-sm p-4 overflow-x-auto my-4">
              <code className="text-[11px] font-mono text-[rgb(180,180,180)]">
                {codeContent.join('\n')}
              </code>
            </pre>
          )
          codeContent = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
          codeLang = line.replace('```', '').trim()
        }
        return
      }

      if (inCodeBlock) {
        codeContent.push(line)
        return
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-[13px] font-bold text-[rgb(200,200,200)] uppercase tracking-widest mt-8 mb-3 border-b border-[rgb(40,40,45)] pb-2">
            {line.replace('### ', '')}
          </h3>
        )
        return
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-[15px] font-bold text-[rgb(220,220,220)] uppercase tracking-wider mt-6 mb-3">
            {line.replace('## ', '')}
          </h2>
        )
        return
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-[18px] font-bold text-[rgb(220,220,220)] uppercase tracking-widest mb-6">
            {line.replace('# ', '')}
          </h1>
        )
        return
      }

      // List items
      if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true
        }
        elements.push(
          <div key={i} className="flex items-start space-x-2 text-[13px] text-[rgb(160,160,160)] font-mono my-1 ml-4">
            <span className="text-[rgb(80,80,85)] mt-1">●</span>
            <span dangerouslySetInnerHTML={{ __html: line.trim().substring(2).replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(200,200,200)]">$1</strong>') }} />
          </div>
        )
        return
      } else {
        inList = false
      }

      // Empty lines
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-4" />)
        return
      }

      // Regular text with inline formatting
      elements.push(
        <p key={i} className="text-[13px] text-[rgb(160,160,160)] font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(200,200,200)]">$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-[rgb(30,30,35)] px-1 rounded text-[rgb(180,180,180)]">$1</code>') }} />
      )
    })

    return elements
  }

  return (
    <div className="h-screen flex flex-col bg-[rgb(5,5,8)]">
      {/* Header */}
      <div className="border-b border-[rgb(40,40,45)] bg-[rgb(10,10,15)] shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-[rgb(100,100,105)] hover:text-[rgb(180,180,180)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-mono">Back to Reports</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 ${config.bg} bg-opacity-10 border ${config.border} rounded-sm`}>
              <span className={`text-[10px] font-bold tracking-widest ${config.color}`}>{severity}</span>
            </div>
            {cvss && (
              <div className="px-3 py-1 bg-[rgb(20,20,25)] border border-[rgb(40,40,45)] rounded-sm">
                <span className="text-[10px] font-mono text-[rgb(140,140,145)]">CVSS: {cvss}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto pb-12">
          {renderMarkdown(report.content)}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function ReportsPage() {
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null)

  if (selectedVuln) {
    return <VulnerabilityDetail vulnId={selectedVuln.id} onBack={() => setSelectedVuln(null)} />
  }

  return (
    <div className="h-screen flex flex-col bg-[rgb(5,5,8)]">
      {/* Header */}
      <div className="border-b border-[rgb(40,40,45)] bg-[rgb(10,10,15)] shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-[rgb(100,100,105)] hover:text-[rgb(180,180,180)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-mono">Back to Dashboard</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[rgb(100,100,105)]" />
            <h1 className="text-lg font-bold text-[rgb(200,200,200)] uppercase tracking-widest">
              Vulnerability Reports
            </h1>
          </div>

          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <VulnerabilityList onSelect={setSelectedVuln} />
      </div>
    </div>
  )
}
