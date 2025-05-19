import { PositionLibrary } from "./utils/position";
import { TickMath } from "./utils";
import { SqrtPriceMath } from "./utils";
import JSBI from "jsbi";
import { sqrt } from "@uniswap/sdk-core";
import { encodeSqrtRatioX96 } from "./utils";

export function createThenRemoveFromB(
  sqrtPriceCurrent: JSBI,
  tickLower: number,
  tickUpper: number,
  amountBInput: number
): Readonly<{
  amountAInput: JSBI;
  amountBInput: JSBI;
  amountALeft: JSBI;
  amountBLeft: JSBI;
  amountARight: JSBI;
  amountBRight: JSBI;
}> {
  // in range
  let lowerPrice = TickMath.getSqrtRatioAtTick(tickLower);
  let upperPrice = TickMath.getSqrtRatioAtTick(tickUpper);
  let liquidityB = SqrtPriceMath.getLiquidityFromB(
    lowerPrice,
    sqrtPriceCurrent,
    JSBI.BigInt(amountBInput),
    true
  );
  console.log(liquidityB.toString());
  let amountAInput = SqrtPriceMath.getAmount0Delta(
    sqrtPriceCurrent,
    upperPrice,
    liquidityB,
    false
  );

  let { amountA: amountALeft, amountB: amountBLeft } =
    PositionLibrary.getAmountAAndB(
      upperPrice,
      tickLower,
      tickUpper,
      liquidityB
    );

  let { amountA: amountARight, amountB: amountBRight } =
    PositionLibrary.getAmountAAndB(
      lowerPrice,
      tickLower,
      tickUpper,
      liquidityB
    );
  return {
    amountAInput: amountAInput,
    amountBInput: JSBI.BigInt(amountBInput),
    amountALeft,
    amountBLeft,
    amountARight,
    amountBRight,
  };
}

export function createThenRemoveFromA(
  sqrtPriceCurrent: JSBI,
  tickLower: number,
  tickUpper: number,
  amountAInput: number
): Readonly<{
  amountAInput: JSBI;
  amountBInput: JSBI;
  amountALeft: JSBI;
  amountBLeft: JSBI;
  amountARight: JSBI;
  amountBRight: JSBI;
}> {
  // in range
  let lowerPrice = TickMath.getSqrtRatioAtTick(tickLower);
  let upperPrice = TickMath.getSqrtRatioAtTick(tickUpper);
  let liquidityA = SqrtPriceMath.getLiquidityFromA(
    sqrtPriceCurrent,
    upperPrice,
    JSBI.BigInt(amountAInput),
    true
  );
  console.log(liquidityA.toString());
  let amountBInput = SqrtPriceMath.getAmount1Delta(
    lowerPrice,
    sqrtPriceCurrent,
    liquidityA,
    false
  );

  let { amountA: amountALeft, amountB: amountBLeft } =
    PositionLibrary.getAmountAAndB(
      upperPrice,
      tickLower,
      tickUpper,
      liquidityA
    );

  let { amountA: amountARight, amountB: amountBRight } =
    PositionLibrary.getAmountAAndB(
      lowerPrice,
      tickLower,
      tickUpper,
      liquidityA
    );
  return {
    amountAInput: JSBI.BigInt(amountAInput),
    amountBInput,
    amountALeft,
    amountBLeft,
    amountARight,
    amountBRight,
  };
}

let sqrtPriceFromTick = TickMath.getSqrtRatioAtTick(20000);

export function priceToSqrtPrice(price: number): JSBI {
  return encodeSqrtRatioX96(price * 1000000000, 100000000);
}

let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("51641728865761437241");
let res = createThenRemoveFromA(
  sqrtPriceCurrent,
  19535,
  21542,
  1000000000000000000
);

// console.log(res.amountAInput.toString());
// console.log(res.amountBInput.toString());
// console.log(res.amountALeft.toString());
// console.log(res.amountBLeft.toString());
// console.log(res.amountARight.toString());
// console.log(res.amountBRight.toString());
