'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, Network, Database, Zap, TrendingUp } from 'lucide-react'

interface Metric {
  label: string
  value: string
  percentage?: number
  status: 'good' | 'warning' | 'critical'
  icon: React.ReactNode
}

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'CPU Usage',
      value: '23%',
      percentage: 23,
      status: 'good',
      icon: <Cpu className="h-4 w-4" />
    },
    {
      label: 'Memory',
      value: '2.1GB',
      percentage: 42,
      status: 'good',
      icon: <MemoryStick className="h-4 w-4" />
    },
    {
      label: 'Network I/O',
      value: '1.2 MB/s',
      status: 'good',
      icon: <Network className="h-4 w-4" />
    },
    {
      label: 'Hunter API',
      value: 'Healthy',
      status: 'good',
      icon: <Database className="h-4 w-4" />
    },
    {
      label: 'Analysis Rate',
      value: '4.2/min',
      status: 'good',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      label: 'Response Time',
      value: '120ms',
      status: 'good',
      icon: <Zap className="h-4 w-4" />
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-terminal-green'
      case 'warning':
        return 'text-terminal-amber'
      case 'critical':
        return 'text-terminal-red'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-terminal-green/20'
      case 'warning':
        return 'bg-terminal-amber/20'
      case 'critical':
        return 'bg-terminal-red/20'
      default:
        return 'bg-gray-800/20'
    }
  }

  return (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">System Metrics</h3>
        <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
      
      <div className="grid grid-cols-6 gap-4 mt-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${getStatusBg(metric.status)} border border-gray-700/50`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={getStatusColor(metric.status)}>
              {metric.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{metric.label}</span>
                <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
              </div>
              {metric.percentage !== undefined && (
                <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                  <motion.div
                    className={`h-1 rounded-full ${
                      metric.status === 'good' ? 'bg-terminal-green' :
                      metric.status === 'warning' ? 'bg-terminal-amber' :
                      'bg-terminal-red'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}