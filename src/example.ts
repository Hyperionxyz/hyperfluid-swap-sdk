import { CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Route, Trade } from "./entities";
import { Pool } from "./entities/pool";
import { Token } from "./entities/token";
import { fetchPoolTickInfo } from "./fetchTickInfo";
import { SqrtPriceMath } from "./utils";
import { getAmountOut } from "./viewGetAmount";
import { AccountAddress } from "@aptos-labs/ts-sdk";

function getLongAddress(address: string) {
  return AccountAddress.fromString(address).toStringLong();
}

async function main() {
  // make sure you have transform short address to long format
  const token0 = new Token(
    1,
    getLongAddress(
      "0x000000000000000000000000000000000000000000000000000000000000000a"
    ),
    8,
    "apt",
    "token0"
  );
  const token1 = new Token(
    1,
    getLongAddress(
      "0xb36527754eb54d7ff55daf13bcb54b42b88ec484bd6f0e3b2e0d1db169de6451"
    ),
    8,
    "ami",
    "token1"
  );

  // fetch pool tick infos.
  // fetchMyQuery take two params.
  // first one is tick offset, it declares how much offset from current tick u want both side.
  // second one is pool id (pool object address).
  // when give offset 0, it means return all the available ticks.
  let poolId =
    "0x617a777d6a19da5bf346af49a7f648acce66db9dd3f98c78bd10ed556708a7da";
  let a: any = await fetchPoolTickInfo(100, poolId);
  const poolInfo = a.data.api.getPoolTickInfo;

  const feeAmount = poolInfo.feeRate;
  const sqrtRatioX96 = SqrtPriceMath.getSqrtPrice(poolInfo.sqrtPrice);
  const liquidity = poolInfo.activeLPAmount;
  const currentTick = poolInfo.currentTick;
  let ticks = poolInfo.ticks;

  const makePool = (token0: Token, token1: Token) => {
    return new Pool(
      token0,
      token1,
      feeAmount,
      sqrtRatioX96,
      liquidity,
      currentTick,
      ticks
    );
  };

  // initialize pool state
  const pool_0_1 = makePool(token0, token1);

  // calc swap token_b to token_a when give a exact output
  const b2aExactOutput = await Trade.fromRoute(
    new Route([pool_0_1], token1, token0),
    CurrencyAmount.fromRawAmount(token0, 10000000), // 10 usdt
    TradeType.EXACT_OUTPUT
  );

  // calc swap token_a to token_b when give a exact input
  const a2bExactInput = await Trade.fromRoute(
    new Route([pool_0_1], token0, token1),
    CurrencyAmount.fromRawAmount(token0, 10000000000), // 10 usdt
    TradeType.EXACT_INPUT
  );

  const a2bExactInputPool = await pool_0_1.getOutputAmount(
    CurrencyAmount.fromRawAmount(token0, 10000000000)
  );

  // call view func to verify the result
  const b2aExactOutputByView = await getAmountOut(
    poolId,
    token0.address,
    10000000000
  );
  const a2bExactInputByView = await getAmountOut(
    poolId,
    token0.address,
    10000000
  );

  console.log(
    "how-much-output-when-a2b-exact-input: ",
    a2bExactInput.outputAmount.quotient.toString()
  );
  console.log(
    "how-much-output-when-a2b-exact-input-pool: ",
    a2bExactInputPool[0].quotient.toString()
  );
  // console.log(
  //   "how-much-output-when-a2b-exact-input-by-view: ",
  //   a2bExactInputByView.toString()
  // );
  // console.log(
  //   "how-much-input-when-b2a-exact-output: ",
  //   b2aExactOutput.inputAmount.quotient.toString()
  // );
  // console.log(
  //   "how-much-input-when-b2a-exact-output-by-view: ",
  //   b2aExactOutputByView.toString()
  // );
}

(async () => {
  setInterval(async () => {
    await main();
  }, 1000);
})();
