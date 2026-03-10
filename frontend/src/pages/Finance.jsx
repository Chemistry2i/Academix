import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CurrencyDollarIcon, PlusIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'

const Finance = () => {
  const [financeStats] = useState({
    totalRevenue: 125000,
    pendingFees: 25000,
    expenses: 85000,
    netIncome: 40000
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Track revenue, expenses, and student fees</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${financeStats.totalRevenue.toLocaleString()}`}
          change="+12%"
          changeType="positive"
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatCard
          title="Pending Fees"
          value={`$${financeStats.pendingFees.toLocaleString()}`}
          change="-5%"
          changeType="positive"
          icon={BanknotesIcon}
          color="yellow"
        />
        <StatCard
          title="Expenses"
          value={`$${financeStats.expenses.toLocaleString()}`}
          change="+3%"
          changeType="negative"
          icon={CreditCardIcon}
          color="red"
        />
        <StatCard
          title="Net Income"
          value={`$${financeStats.netIncome.toLocaleString()}`}
          change="+8%"
          changeType="positive"
          icon={CurrencyDollarIcon}
          color="blue"
        />
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="text-center py-8">
            <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Financial management interface coming soon!</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default Finance