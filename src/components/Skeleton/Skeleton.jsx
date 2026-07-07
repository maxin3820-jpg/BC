import React from 'react'
import './Skeleton.css'

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-thumb shimmer" />
    <div className="skeleton-body">
      <div className="skeleton-line w80 shimmer" />
      <div className="skeleton-line w60 shimmer" />
      <div className="skeleton-line w40 shimmer" />
      <div className="skeleton-btn shimmer" />
    </div>
  </div>
)

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export default SkeletonGrid
