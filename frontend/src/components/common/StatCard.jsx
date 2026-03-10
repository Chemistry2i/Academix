import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const StatCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  color = 'blue',
  className = '',
  subtitle
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      trend: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      trend: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      trend: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      trend: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      trend: 'text-orange-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      trend: 'text-indigo-600'
    },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      trend: 'text-emerald-600'
    },
    teal: {
      bg: 'bg-teal-50',
      icon: 'text-teal-600',
      trend: 'text-teal-600'
    },
    pink: {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      trend: 'text-pink-600'
    }
  }

  // Fallback to blue if color doesn't exist
  const currentColor = colorClasses[color] || colorClasses.blue

  return (
    <motion.div
      className={clsx(
        'bg-white p-6 rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow duration-200',
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={clsx(
                'text-sm font-medium',
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              )}>
                {change}
              </span>
              <span className="text-gray-500 text-sm ml-1">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            currentColor.bg
          )}>
            <Icon className={clsx(
              'w-6 h-6',
              currentColor.icon
            )} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard