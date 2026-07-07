import React from 'react'

export default function Loading() {
  return (
    <div className="container mx-auto p-4 max-w-7xl mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Video Gallery</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card bg-base-100 shadow-xl border border-base-200">
            {/* Video Thumbnail Skeleton */}
            <div className="skeleton h-48 w-full rounded-t-2xl rounded-b-none"></div>
            
            <div className="card-body p-4">
              {/* Title Skeleton */}
              <div className="skeleton h-6 w-3/4 mb-2"></div>
              {/* Description Skeleton */}
              <div className="skeleton h-4 w-full mb-1"></div>
              <div className="skeleton h-4 w-2/3 mb-4"></div>
              
              {/* Stats Skeleton */}
              <div className="flex justify-between mt-2">
                <div className="skeleton h-4 w-1/4"></div>
                <div className="skeleton h-4 w-1/4"></div>
              </div>
              
              {/* Button Skeleton */}
              <div className="skeleton h-10 w-full mt-4 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
