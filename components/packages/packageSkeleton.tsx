import React from 'react';

export function PackageCardSkeleton() {
  return (
    <div className="bg-gray-50 shadow-md rounded-lg overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gray-200"></div>
      <div className="p-4 space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}