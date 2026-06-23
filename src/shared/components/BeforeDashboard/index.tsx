import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <h2 className={`${baseClass}__welcome`}>Welcome back</h2>
      <p className={`${baseClass}__lede`}>
        Write, review, and publish from here. Anything waiting on you shows up just above.
      </p>
      <div className={`${baseClass}__seed`}>
        <SeedButton />
        <span>Starting fresh? Seed a few sample pages and posts to explore.</span>
      </div>
    </div>
  )
}

export default BeforeDashboard
