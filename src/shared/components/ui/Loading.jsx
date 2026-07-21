// ponytail: Minimal premium loaders and skeleton components for visual transitions.
import React from 'react';
import { cn } from '../../utils/cn';

export function Spinner({ className }) {
  return (
    <div className={cn('w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin', className)} />
  );
}

export function PageLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Spinner className="w-10 h-10 border-t-accent" />
      <span className="text-sm font-bold text-gray-500">جاري تحميل البيانات...</span>
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div 
      className={cn('animate-pulse bg-gray-200 rounded-lg', className)} 
      {...props} 
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
