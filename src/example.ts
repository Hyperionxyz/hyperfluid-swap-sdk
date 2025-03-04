import { CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { Route, Trade } from "./entities";
import { Pool } from "./entities/pool";
import { Token } from "./entities/token";
import { fetchPoolTickInfo } from "./fetchTickInfo";
import { getAmountOut } from "./viewGetAmount";

async function main() {
  const token0 = new Token(
    1,
    "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
    6,
    "usdt",
    "token0"
  );
  const token1 = new Token(
    1,
    "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    6,
    "usdc",
    "token1"
  );

  // fetch pool tick infos.
  // fetchMyQuery take two params.
  // first one is tick offset, it declares how much offset from current tick u want both side.
  // second one is pool id (pool object address).
  // when give offset 0, it means return all the available ticks.
  let poolId =
    "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127";
  let a: any = await fetchPoolTickInfo(100, poolId);
  const poolInfo = a.data.api.getPoolTickInfo;

  const feeAmount = poolInfo.feeRate;
  const sqrtRatioX96 = JSBI.leftShift(
    JSBI.BigInt(poolInfo.sqrtPrice),
    JSBI.BigInt(32)
  );
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
    CurrencyAmount.fromRawAmount(token0, 10000000), // 10 usdt
    TradeType.EXACT_INPUT
  );

  // call view func to verify the result
  const b2aExactOutputByView = await getAmountOut(
    poolId,
    token0.address,
    10000000
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
    "how-much-output-when-a2b-exact-input-by-view: ",
    a2bExactInputByView.toString()
  );
  console.log(
    "how-much-input-when-b2a-exact-output: ",
    b2aExactOutput.inputAmount.quotient.toString()
  );
  console.log(
    "how-much-input-when-b2a-exact-output-by-view: ",
    b2aExactOutputByView.toString()
  );
}

(async () => {
  setInterval(async () => {
    await main();
  }, 1000);
})();
