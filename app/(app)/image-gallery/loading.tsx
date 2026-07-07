import React from 'react'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 max-w-7xl mt-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-base-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="skeleton w-8 h-8 rounded-full"></div>
            <div className="skeleton h-10 w-48"></div>
          </div>
          <div className="skeleton h-4 w-64"></div>
        </div>
        <div className="skeleton h-12 w-32 rounded-lg"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
            <div className="skeleton w-full aspect-square rounded-none"></div>
            <div className="card-body p-4">
              <div className="skeleton h-4 w-1/2 mb-2"></div>
              <div className="skeleton h-4 w-1/3 mb-4"></div>
              <div className="skeleton h-10 w-full rounded-lg mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
