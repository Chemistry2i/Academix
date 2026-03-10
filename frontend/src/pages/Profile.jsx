import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCircleIcon, PencilIcon, CameraIcon } from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  
  const [profile, setProfile] = useState({
    firstName: user?.firstName || 'Admin',
    lastName: user?.lastName || 'User',
    email: user?.email || 'admin@academix.com',
    phone: '+256 700 123 456',
    role: user?.role || 'ADMIN',
    department: 'Administration',
    joinDate: '2024-01-15',
    bio: 'Experienced administrator dedicated to educational excellence and student success.'
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
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'primary'}
        >
          <PencilIcon className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="lg:col-span-1">
          <div className="p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-20 h-20 text-primary-600" />
              </div>
              {isEditing && (
                <button className="absolute bottom-4 right-4 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-600">{profile.role}</p>
            <p className="text-sm text-gray-500 mt-1">{profile.department}</p>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="input-field"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-lg">{profile.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <p className="p-2 bg-gray-50 rounded-lg">{profile.role}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <p className="p-2 bg-gray-50 rounded-lg">{profile.joinDate}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="input-field"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg">{profile.bio}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <Button className="bg-primary-600 hover:bg-primary-700">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

export default Profile