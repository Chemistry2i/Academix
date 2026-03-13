import React from 'react'
import { 
  Cog6ToothIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

const Settings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isTeacherPortal = location.pathname.startsWith('/teacher')
  const portalBase = isTeacherPortal ? '/teacher' : location.pathname.startsWith('/admin') ? '/admin' : location.pathname.startsWith('/student') ? '/student' : ''

  const settingsCategories = [
    {
      title: 'Account Settings',
      icon: UserCircleIcon,
      items: [
        {
          name: 'Profile Information',
          description: 'Update your personal information, email, and contact details',
          action: () => navigate(`${portalBase}/profile`),
          available: true
        },
        {
          name: 'Change Password',
          description: 'Update your password to keep your account secure',
          action: () => navigate(`${portalBase}/change-password`),
          available: true
        }
      ]
    },
    {
      title: 'Security',
      icon: ShieldCheckIcon, 
      items: [
        {
          name: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          action: () => console.log('2FA settings'),
          available: false
        },
        {
          name: 'Login Sessions',
          description: 'Manage active sessions and logout from other devices',
          action: () => console.log('Session management'),
          available: false
        }
      ]
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      items: [
        {
          name: 'Email Notifications',
          description: 'Configure which emails you receive from the system',
          action: () => console.log('Email settings'),
          available: false
        },
        {
          name: 'Push Notifications',
          description: 'Manage browser and mobile push notifications',
          action: () => console.log('Push settings'),
          available: false
        }
      ]
    },
    {
      title: 'System Preferences',
      icon: Cog6ToothIcon,
      items: [
        {
          name: 'Language & Region',
          description: 'Set your preferred language and regional settings',
          action: () => console.log('Language settings'),
          available: false
        },
        {
          name: 'Data Export',
          description: 'Download your data and account information',
          action: () => console.log('Data export'),
          available: false
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
        {user && (
          <p className="text-sm text-gray-500 mt-2">
            Logged in as: <span className="font-medium text-gray-900">{user.email}</span>
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {settingsCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <category.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {item.available ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={item.action}
                        >
                          Configure
                        </Button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Settings