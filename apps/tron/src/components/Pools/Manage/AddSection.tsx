import { CogIcon } from "@heroicons/react/24/outline";
import {
	IconButton,
	SettingsModule,
	SettingsOverlay,
	Widget,
	WidgetAction,
	WidgetDescription,
	WidgetHeader,
	WidgetTitle,
} from "@sushiswap/ui";
import { AmountInToken0 } from "../Add/AmountInToken0";
import { AmountInToken1 } from "../Add/AmountIntToken1";
import { Plus } from "../Add/Plus";
import { ReviewAddDialog } from "../Add/ReviewAddDialog";

export const AddSection = () => {
	return (
		<Widget id="addLiquidity" variant="empty">
			<WidgetHeader>
				<WidgetTitle>Add Liquidity</WidgetTitle>
				<WidgetDescription>Provide liquidity to receive SLP tokens.</WidgetDescription>
				<WidgetAction variant="empty">
					<SettingsOverlay
						options={{ slippageTolerance: { storageKey: "sushi-tron-slippage-add-liq" } }} //use this key to get slippage from localStorage
						modules={[SettingsModule.SlippageTolerance]}>
						<IconButton size="sm" name="Settings" icon={CogIcon} variant="secondary" />
					</SettingsOverlay>
				</WidgetAction>
			</WidgetHeader>
			<section className="flex flex-col gap-3 relative w-full">
				<AmountInToken0 />
				<Plus />
				<AmountInToken1 />
			</section>
			<div className="mt-3 w-full flex flex-col">
				<ReviewAddDialog />
			</div>
		</Widget>
	);
};