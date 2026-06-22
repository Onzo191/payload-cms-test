import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/shared/utilities/getGlobals'
import React from 'react'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData} />
}
