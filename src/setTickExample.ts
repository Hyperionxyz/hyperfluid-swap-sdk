import JSBI from "jsbi";
import {
  CurrencyAmount,
  Ether,
  Percent,
  TradeType,
  WETH9,
} from "@uniswap/sdk-core";
import { Token } from "./entities/token";
import { FeeAmount, TICK_SPACINGS } from "./constants";
import { Pool } from "./entities/pool";
import { nearestUsableTick, TickMath } from "./utils";
import { encodeSqrtRatioX96 } from "./utils/encodeSqrtRatioX96";
import { Route, Trade } from "./entities";
import { SqrtPriceMath } from "./utils";

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
const makePool = (token0: Token, token1: Token) => {
  let liquidity = 10000;
  return new Pool(
    token0,
    token1,
    FeeAmount.LOW,
    TickMath.getSqrtRatioAtTick(28101),
    liquidity,
    28100,
    [
      {
        index: nearestUsableTick(
          TickMath.MIN_TICK,
          TICK_SPACINGS[FeeAmount.LOW]
        ),
        liquidityNet: liquidity,
        liquidityGross: liquidity,
      },
      {
        index: nearestUsableTick(
          TickMath.MAX_TICK,
          TICK_SPACINGS[FeeAmount.LOW]
        ),
        liquidityNet: -liquidity,
        liquidityGross: liquidity,
      },
    ]
  );
};

let pool = makePool(token0, token1);
console.log(pool.tickCurrent);
pool.tickDataProvider.setTick(28100, 10000, 10000);
console.log(pool.tickDataProvider.getTick(28100));
