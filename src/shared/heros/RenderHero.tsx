import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/shared/heros/HighImpact'
import { LowImpactHero } from '@/shared/heros/LowImpact'
import { MediumImpactHero } from '@/shared/heros/MediumImpact'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
