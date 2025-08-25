import React from 'react'
import LeavesTable from './LeavesTable'
import { useNavigate } from 'react-router-dom'

const LeavesHomePageAdmin = () => {
  const navigate = useNavigate()
  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">View Leaves</h2>
          <p className="text-gray-600 mt-1 text-sm">
            View all The leave requests, track their status, and accept or reject them 
          </p>
        </div>
        
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <LeavesTable />
      </div>
    </div>

  )
}

export default LeavesHomePageAdmin