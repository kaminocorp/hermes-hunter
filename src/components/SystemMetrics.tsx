'use client'

import { useState, useEffect } from 'react'
import { Cpu, MemoryStick, Network, Database, Zap, TrendingUp } from 'lucide-react'

interface Metric {
  label: string
  value: string
  percentage?: number
  status: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
}

export default function SystemMetrics() {
  const [metrics] = useState<Metric[]>([
    {
      label: 'CPU Usage',
      value: '23%',
      percentage: 23,
      status: 'good',
      icon: <Cpu className="h-4 w-4" strokeWidth={1.5} />
    },
    {
      label: 'Memory',
      value: '2.1GB',
      percentage: 42,
      status: 'good',
      icon: <MemoryStick className="h-4 w-4" strokeWidth={1.5} />
    },
    {
      label: 'Network I/O',
      value: '1.2 MB/s',
      status: 'good',
      icon: <Network className="h-4 w-4" strokeWidth={1.5} />
    },
    {
      label: 'Hunter API',
      value: 'Healthy',
      status: 'good',
      icon: <Database className="h-4 w-4" strokeWidth={1.5} />
    },
    {
      label: 'Analysis Rate',
      value: '4.2/min',
      status: 'good',
      icon: <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
    },
    {
      label: 'Response Time',
      value: '120ms',
      status: 'good',
      icon: <Zap className="h-4 w-4" strokeWidth={1.5} />
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-[rgb(80,140,80)]'
      case 'warning':
        return 'text-[rgb(160,120,60)]'
      case 'critical':
        return 'text-[rgb(180,50,50)]'
      default:
        return 'text-[rgb(100,100,105)]'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-[rgb(80,140,80)]/20'
      case 'warning':
        return 'bg-[rgb(160,120,60)]/20'
      case 'critical':
        return 'bg-[rgb(180,50,50)]/20'
      default:
        return 'bg-[rgb(40,40,45)]/20'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-[rgb(80,140,80)]'
      case 'warning':
        return 'bg-[rgb(160,120,60)]'
      case 'critical':
        return 'bg-[rgb(180,50,50)]'
      default:
        return 'bg-[rgb(100,100,105)]'
    }
  }

  return (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-[rgb(160,160,160)] tracking-widest uppercase">System Metrics</h3>
        <span className="text-[10px] text-[rgb(80,80,80)] tracking-wider">
          LAST UPDATE: {new Date().toLocaleTimeString('en-GB')} UTC
        </span>
      </div>
      
      <div className="grid grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`flex items-center space-x-3 px-3 py-3 ${getStatusBg(metric.status)} border border-[rgb(60,60,65)]`}
          >
            <div className={getStatusColor(metric.status)}>
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[rgb(100,100,105)] tracking-wider uppercase">
                  {metric.label}
                </span>
                <span className={`text-sm font-bold ${getStatusColor(metric.status)} tracking-wider`}>
                  {metric.value}
                </span>
              </div>
              {metric.percentage !== undefined && (
                <div className="progress-container">
                  <div
                    className={`progress-fill ${
                      metric.status === 'warning' ? 'warning' :
                      metric.status === 'critical' ? 'critical' : ''
                    }`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
