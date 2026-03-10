import React, { useState } from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import Card from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'

const Results = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
        <p className="text-gray-600 mt-1">View and manage student examination results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Exams"
          value="12"
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Average Score"
          value="78.5%"
          icon={ChartBarIcon}
          color="green"
        />
        <StatCard
          title="Pass Rate"
          value="89%"
          icon={ChartBarIcon}
          color="purple"
        />
        <StatCard
          title="Top Performers"
          value="45"
          icon={ChartBarIcon}
          color="yellow"
        />
      </div>

      <Card>
        <div className="text-center py-12">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Results Management</h3>
          <p className="text-gray-600">Results management interface coming soon!</p>
        </div>
      </Card>
    </div>
  )
}

export default Results