import { useBreakpoint } from '@sushiswap/hooks'
import { GenericTable } from '@sushiswap/ui/future/components/table/GenericTable'
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from '@sushiswap/wagmi'

import { NAME_COLUMN_V3, POSITION_SIZE_CELL, POSITION_UNCLAIMED_CELL, PRICE_RANGE_COLUMN } from './Cells/columns'
import { ConcentratedLiquidityPosition, useConcentratedLiquidityPositions } from '@sushiswap/wagmi/future/hooks'
import { classNames } from '@sushiswap/ui'
import ConcentratedCurveIcon from '@sushiswap/ui/future/components/icons/ConcentratedCurveIcon'
import { V3_SUPPORTED_CHAIN_IDS } from '@sushiswap/v3-sdk'
import { Writeable } from 'zod'
import { usePoolFilters } from '../../../PoolsFiltersProvider'

const COLUMNS = [NAME_COLUMN_V3, PRICE_RANGE_COLUMN, POSITION_SIZE_CELL, POSITION_UNCLAIMED_CELL] as any

export const ConcentratedPositionsTable: FC<{ variant?: 'default' | 'minimal'; poolId?: string }> = ({
  variant = 'default',
  poolId,
}) => {
  const [hide, setHide] = useState(true)
  const { address } = useAccount()
  const { isSm } = useBreakpoint('sm')
  const { isMd } = useBreakpoint('md')
  const { chainIds, tokenSymbols } = usePoolFilters()
  const [columnVisibility, setColumnVisibility] = useState({})

  const {
    data: positions,
    isLoading,
    isInitialLoading,
  } = useConcentratedLiquidityPositions({
    account: address,
    chainIds: V3_SUPPORTED_CHAIN_IDS as Writeable<typeof V3_SUPPORTED_CHAIN_IDS>,
  })

  const _positions = useMemo(() => {
    const _tokenSymbols = tokenSymbols?.filter((el) => el !== '') || []

    return (positions || [])
      ?.filter((el) => chainIds.includes(el.chainId))
      .filter((el) =>
        _tokenSymbols.length > 0 ? _tokenSymbols.some((symbol) => [el.token0, el.token1].includes(symbol)) : true
      )
      .filter((el) => {
        return (
          (hide ? !el.liquidity?.eq('0') : true) && (poolId ? el.address.toLowerCase() === poolId.toLowerCase() : true)
        )
      })
  }, [hide, poolId, positions, chainIds, tokenSymbols])

  const table = useReactTable<ConcentratedLiquidityPosition>({
    data: _positions,
    state: {
      // sorting,
      columnVisibility,
    },
    columns: COLUMNS,
    // onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    if (isSm && !isMd) {
      setColumnVisibility({})
    } else if (isSm) {
      setColumnVisibility({})
    } else {
      setColumnVisibility({
        positionSize: false,
        unclaimed: false,
      })
    }
  }, [isMd, isSm])

  const rowLink = useCallback((row: ConcentratedLiquidityPosition) => {
    return `/position/${row.chainId}:${row.tokenId}`
  }, [])

  if (variant === 'minimal') {
    return (
      <GenericTable<ConcentratedLiquidityPosition>
        table={table}
        loading={isInitialLoading}
        placeholder="No positions found"
        pageSize={!_positions ? 5 : _positions?.length}
        linkFormatter={rowLink}
        loadingOverlay={false}
      />
    )
  }

  return (
    <>
      <div className={classNames('w-full group')}>
        <h1 className="flex items-center justify-between gap-2 px-4 py-4 text-sm font-semibold text-gray-700 group-hover:text-gray-900 dark:text-slate-200 dark:group-hover:text-slate-50 group-hover:dark:text-slate-50">
          <span className="flex items-center gap-3">
            <ConcentratedCurveIcon id="ctable" width={20} height={20} className="saturate-200" /> Your Positions{' '}
            {positions ? `(${positions.length})` : ''}
          </span>
          <div className="flex gap-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setHide((prev) => !prev)
              }}
              className="text-sm text-blue group-hover:text-blue-600"
            >
              {hide ? 'Show closed positions' : 'Hide closed positions'}
            </button>
          </div>
        </h1>
      </div>
      <div className="mb-[120px]">
        <GenericTable<ConcentratedLiquidityPosition>
          table={table}
          loading={Boolean(isLoading && address)}
          placeholder="No positions found"
          pageSize={_positions?.length ? _positions.length : 1}
          linkFormatter={rowLink}
          loadingOverlay={false}
          testId={'concentrated-positions'}
        />
      </div>
    </>
  )
}
