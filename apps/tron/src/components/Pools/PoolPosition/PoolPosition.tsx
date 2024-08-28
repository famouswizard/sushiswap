import { formatUSD } from "sushi/format";
import { IToken } from "src/types/token-type";
import {
	Card,
	CardContent,
	CardDescription,
	CardGroup,
	CardHeader,
	CardLabel,
	CardTitle,
} from "@sushiswap/ui";
import { usePoolState } from "src/app/pool/pool-provider";
import { useTotalSupply } from "src/hooks/useTotalSupply";
import { useEffect, useMemo } from "react";
import { useRemoveLiqDispatch } from "src/app/pool/[poolId]/remove-provider";
import { formatUnitsForInput, parseUnits, toBigNumber } from "src/utils/formatters";
import { PAIR_DECIMALS } from "src/constants/pair-decimals";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { useTokenBalance } from "src/hooks/useTokenBalance";
import { LiquidityItem } from "../PoolDetails/LiquidityItem";
import { useStablePrice } from "src/hooks/useStablePrice";

export const PoolPosition = ({
	token0,
	token1,
	isLoading,
}: {
	token0: IToken | undefined;
	token1: IToken | undefined;
	isLoading: boolean;
}) => {
	const token0StakedInUsd = 0;
	const token1StakedInUsd = 0;
	const { reserve0, reserve1, pairAddress } = usePoolState();
	const { setTotalSupplyLP, setAmountToken0PerLP, setAmountToken1PerLP, setLPBalance } =
		useRemoveLiqDispatch();
	const { data: totalSupply, isLoading: isLoadingTotalSupply } = useTotalSupply({
		tokenAddress: pairAddress,
	});
	const { address } = useWallet();
	const { data: lpBalance, isLoading: isLoadingLPBalance } = useTokenBalance({
		accountAddress: address,
		tokenAddress: pairAddress,
	});
	const { data: token0Price, isLoading: isLoadingToken0Price } = useStablePrice({ token: token0 });
	const { data: token1Price, isLoading: isLoadingToken1Price } = useStablePrice({ token: token1 });

	useEffect(() => {
		if (lpBalance && !isLoadingLPBalance) {
			setLPBalance(lpBalance);
		}
	}, [lpBalance, isLoadingLPBalance]);

	useEffect(() => {
		if (totalSupply && !isLoadingTotalSupply) {
			setTotalSupplyLP(totalSupply);
		}
	}, [totalSupply, isLoadingTotalSupply]);

	const _amountToken0PerLP = useMemo(() => {
		if (!totalSupply || !reserve0) return "";
		const formattedReserve0 = formatUnitsForInput(reserve0, token0?.decimals ?? 0);
		const formattedTotalSupply = formatUnitsForInput(totalSupply, PAIR_DECIMALS);
		const resBN = toBigNumber(formattedReserve0);
		const totalSupplyBN = toBigNumber(formattedTotalSupply);
		return String(resBN.div(totalSupplyBN));
	}, [reserve0, totalSupply, token0]);

	useEffect(() => {
		if (_amountToken0PerLP) {
			setAmountToken0PerLP(_amountToken0PerLP);
		}
	}, [_amountToken0PerLP]);

	const _amountToken1PerLP = useMemo(() => {
		if (!totalSupply || !reserve1) return "";
		const formattedReserve1 = formatUnitsForInput(reserve1, token1?.decimals ?? 0);
		const formattedTotalSupply = formatUnitsForInput(totalSupply, PAIR_DECIMALS);
		const resBN = toBigNumber(formattedReserve1);
		const totalSupplyBN = toBigNumber(formattedTotalSupply);
		return String(resBN.div(totalSupplyBN));
	}, [reserve1, totalSupply, token1]);

	useEffect(() => {
		if (_amountToken1PerLP) {
			setAmountToken1PerLP(_amountToken1PerLP);
		}
	}, [_amountToken1PerLP]);

	const amountToken0 = useMemo(() => {
		if (!lpBalance || !_amountToken0PerLP) return "0";
		const formattedLP = formatUnitsForInput(lpBalance, PAIR_DECIMALS);
		const lpTokenAmountBeingRemovedBN = toBigNumber(formattedLP);
		const amountToken0PerLPBN = toBigNumber(_amountToken0PerLP);
		return String(lpTokenAmountBeingRemovedBN.times(amountToken0PerLPBN));
	}, [lpBalance, _amountToken0PerLP]);

	const amountToken1 = useMemo(() => {
		if (!lpBalance || !_amountToken1PerLP) return "0";
		const formattedLP = formatUnitsForInput(lpBalance, PAIR_DECIMALS);
		const lpTokenAmountBeingRemovedBN = toBigNumber(formattedLP);
		const amountToken1PerLPBN = toBigNumber(_amountToken1PerLP);
		return String(lpTokenAmountBeingRemovedBN.times(amountToken1PerLPBN));
	}, [lpBalance, _amountToken1PerLP]);

	const loading = isLoading || isLoadingToken0Price || isLoadingToken1Price;

	const token0UnstakedInUsd = Number(token0Price) * Number(amountToken0);
	const token1UnstakedInUsd = Number(token1Price) * Number(amountToken1);

	return (
		<Card>
			<CardHeader>
				<CardTitle>My Position</CardTitle>
				<CardDescription>
					<span className="text-sm text-right dark:text-slate-50 text-gray-900">
						{formatUSD(token0StakedInUsd + token1StakedInUsd + token0UnstakedInUsd + token1UnstakedInUsd)}
					</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<CardGroup>
					<CardLabel>Unstaked</CardLabel>
					<LiquidityItem
						isLoading={loading}
						token={token0}
						amount={String(parseUnits(amountToken0, token0?.decimals ?? 18))}
						usdAmount={String(token0UnstakedInUsd)}
					/>
					<LiquidityItem
						isLoading={loading}
						token={token1}
						amount={String(parseUnits(amountToken1, token1?.decimals ?? 18))}
						usdAmount={String(token1UnstakedInUsd)}
					/>
				</CardGroup>
				<CardGroup>
					<CardLabel>Staked</CardLabel>
					<LiquidityItem isLoading={isLoading} token={token0} amount={"0"} usdAmount={"0"} />
					<LiquidityItem isLoading={isLoading} token={token1} amount={"0"} usdAmount={"0"} />
				</CardGroup>
			</CardContent>
		</Card>
	);
};