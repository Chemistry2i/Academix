import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Button from './Button'

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isLoading = false,
  showCancel = true
}) => {
  if (!isOpen) return null

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      confirmBg: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: InformationCircleIcon,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmBg: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex items-start mb-4">
          <div className={`flex-shrink-0 ${config.bgColor} ${config.borderColor} border rounded-full p-2 mr-3`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex justify-end space-x-3">
          {showCancel && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              className={config.confirmBg}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const BulkActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  items = [], 
  action = 'delete',
  isLoading = false 
}) => {
  const actionConfig = {
    delete: {
      title: 'Delete Classes',
      message: `Are you sure you want to delete ${items.length} selected class${items.length > 1 ? 'es' : ''}?`,
      confirmText: 'Delete Classes',
      type: 'error'
    },
    activate: {
      title: 'Activate Classes',
      message: `Activate ${items.length} selected class${items.length > 1 ? 'es' : ''}?`,
      confirmText: 'Activate Classes',
      type: 'success'
    },
    deactivate: {
      title: 'Deactivate Classes',
      message: `Deactivate ${items.length} selected class${items.length > 1 ? 'es' : ''}?`,
      confirmText: 'Deactivate Classes',
      type: 'warning'
    }
  }

  const config = actionConfig[action]

  return (
    <NotificationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type={config.type}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      isLoading={isLoading}
    />
  )
}

export { NotificationModal, BulkActionModal }
export default NotificationModal