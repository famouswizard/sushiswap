import {
  MINICHEF_ENABLED_NETWORKS,
  type MiniChefChainId,
} from '@sushiswap/graph-config'
import type { ChainIdVariable, ChainIdsVariable } from 'src/lib/types/chainId'

import {
  type GetMasterChefV1UserPositions,
  type MasterChefV1UserPositions,
  getMasterChefV1UserPositions,
} from 'src/subgraphs/master-chef-v1'
import {
  type GetMasterChefV2UserPositions,
  type MasterChefV2UserPositions,
  getMasterChefV2UserPositions,
} from 'src/subgraphs/master-chef-v2'
import {
  type GetMiniChefUserPositions,
  type MiniChefUserPositions,
  getMiniChefUserPositions,
} from 'src/subgraphs/mini-chef'
import { ChainId } from 'sushi/chain'

export type GetChefUserPositions = Omit<
  GetMasterChefV1UserPositions &
    GetMasterChefV2UserPositions &
    GetMiniChefUserPositions,
  'chainId'
> &
  ChainIdsVariable<1 | MiniChefChainId>

type CombinedPosition = (
  | MasterChefV1UserPositions
  | MasterChefV2UserPositions
  | MiniChefUserPositions
)[number]

export type ChefPosition = Omit<CombinedPosition, 'pool'> & {
  pool:
    | (Omit<CombinedPosition['pool'], 'chainId'> &
        ChainIdVariable<NonNullable<CombinedPosition['pool']>['chainId']>)
    | null
}

export async function getChefUserPositions({
  chainIds = [ChainId.ETHEREUM, ...MINICHEF_ENABLED_NETWORKS],
  ...variables
}: GetChefUserPositions) {
  const miniChefChainIds = chainIds.filter(
    (chainId) => chainId !== ChainId.ETHEREUM,
  ) as MiniChefChainId[]

  const promises = await Promise.allSettled([
    getMasterChefV1UserPositions(variables),
    getMasterChefV2UserPositions(variables),
    ...miniChefChainIds.map((chainId) =>
      getMiniChefUserPositions({
        ...variables,
        chainId,
      }),
    ),
  ])

  const data = [] as ChefPosition[]
  const errors = []

  for (const promise of promises) {
    if (promise.status === 'fulfilled') {
      data.push(...promise.value)
    } else {
      errors.push(promise.reason)
    }
  }

  return { data, errors }
}
