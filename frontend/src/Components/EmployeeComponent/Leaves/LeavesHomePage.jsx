import React from 'react'
import LeavesTable from './LeavesTable'
import { useNavigate } from 'react-router-dom'

const LeavesHomePage = () => {
  const navigate = useNavigate()
  return (
    <div>

      <div className='flex items-center justify-between'>
        <h2 className="text-2xl font-bold  text-gray-800">My Leaves </h2>
        <button
          onClick={() => navigate(`add-leave`)}
          className='bg-green-600 text-white p-1 font-bold rounded hover:bg-green-700'>
            Request Leave
        </button>
      </div>
      <LeavesTable />
    </div>
  )
}

export default LeavesHomePage