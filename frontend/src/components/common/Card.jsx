import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  padding = 'normal',
  shadow = 'normal',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  }

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    normal: 'shadow-card',
    large: 'shadow-lg'
  }

  return (
    <motion.div
      className={clsx(
        'bg-white rounded-xl border border-gray-200',
        shadowClasses[shadow],
        paddingClasses[padding],
        {
          'hover:shadow-card-hover transition-shadow duration-200': hover
        },
        className
      )}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card