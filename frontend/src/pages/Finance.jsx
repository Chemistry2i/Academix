import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CurrencyDollarIcon, PlusIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import { financeService } from '../services/financeService'

const Finance = () => {
  const [financeStats, setFinanceStats] = useState({
    totalRevenue: 0,
    pendingFees: 0,
    totalExpenses: 0,
    netIncome: 0,
    collectionRate: 0,
    activeStudents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinanceData = async () => {
      setLoading(true)
      try {
        const response = await financeService.getStats()
        if (response.success) {
          setFinanceStats({
            totalRevenue: response.data.totalRevenue || 0,
            pendingFees: response.data.pendingFees || 0,
            totalExpenses: response.data.totalExpenses || 0,
            netIncome: response.data.netIncome || 0,
            collectionRate: response.data.collectionRate || 0,
            activeStudents: response.data.activeStudents || 0
          })
        } else {
          console.error('Failed to fetch finance stats:', response.message)
        }
      } catch (error) {
        console.error('Error fetching finance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

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
          value={loading ? "..." : `UGX ${financeStats.totalRevenue.toLocaleString()}`}
          change={loading ? "" : `${financeStats.collectionRate}% collected`}
          changeType="positive"
          icon={CurrencyDollarIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Pending Fees"
          value={loading ? "..." : `UGX ${financeStats.pendingFees.toLocaleString()}`}
          change={loading ? "" : `${financeStats.activeStudents} students`}
          changeType="negative"
          icon={BanknotesIcon}
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Total Expenses"
          value={loading ? "..." : `UGX ${financeStats.totalExpenses.toLocaleString()}`}
          change={loading ? "" : "Monthly total"}
          changeType="neutral"
          icon={CreditCardIcon}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Net Income"
          value={loading ? "..." : `UGX ${financeStats.netIncome.toLocaleString()}`}
          change={loading ? "" : financeStats.netIncome >= 0 ? "Profit" : "Loss"}
          changeType={financeStats.netIncome >= 0 ? "positive" : "negative"}
          icon={CurrencyDollarIcon}
          color="blue"
          loading={loading}
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