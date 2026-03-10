import React from 'react'
import { Outlet } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar'
import Header from './Header'

const TeacherLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default TeacherLayout