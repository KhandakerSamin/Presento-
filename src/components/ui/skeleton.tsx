import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  );
}
