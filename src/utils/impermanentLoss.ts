import { PositionLibrary } from "./position";
import { TickMath } from ".";
import { SqrtPriceMath } from ".";
import JSBI from "jsbi";
import { sqrt } from "@uniswap/sdk-core";
import { encodeSqrtRatioX96 } from ".";

export function impermanentLoss(
  sqrtPriceCurrent: JSBI,
  tickLower: number,
  tickUpper: number,
  sqrtPriceNow: JSBI
): number {
  // in range
  let lowerPrice = TickMath.getSqrtRatioAtTick(tickLower);
  let upperPrice = TickMath.getSqrtRatioAtTick(tickUpper);
  let liquidity = JSBI.BigInt(100000000);
  let { amountA: amountACurrent, amountB: amountBCurrent } =
    PositionLibrary.getAmountAAndB(
      sqrtPriceCurrent,
      tickLower,
      tickUpper,
      liquidity
    );

  let { amountA: amountANow, amountB: amountBNow } =
    PositionLibrary.getAmountAAndB(
      sqrtPriceNow,
      tickLower,
      tickUpper,
      liquidity
    );

  let originValueCurrent = JSBI.ADD(
    JSBI.signedRightShift(
      JSBI.multiply(
        JSBI.BigInt(amountACurrent),
        JSBI.exponentiate(sqrtPriceNow, JSBI.BigInt(2))
      ),
      JSBI.BigInt(192)
    ),
    JSBI.BigInt(amountBCurrent)
  );
  let LPValueNow = JSBI.ADD(
    JSBI.multiply(
      JSBI.BigInt(amountANow),
      JSBI.signedRightShift(
        JSBI.exponentiate(sqrtPriceNow, JSBI.BigInt(2)),
        JSBI.BigInt(192)
      )
    ),
    amountBNow
  );
  console.log(originValueCurrent.toString());
  console.log(LPValueNow.toString());
  let diffRatio = JSBI.divide(
    JSBI.leftShift(
      JSBI.subtract(originValueCurrent, LPValueNow),
      JSBI.BigInt(64)
    ),
    originValueCurrent
  );
  return jsbiToRatio(diffRatio, 64);
}

function jsbiToRatio(fixedPoint: JSBI, denominator: number): number {
  return (
    parseFloat(fixedPoint.toString()) /
    parseFloat(
      JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(denominator)).toString()
    )
  );
}

export function priceToSqrtPrice(price: number): JSBI {
  return encodeSqrtRatioX96(price * 1000000000, 1000000000);
}

let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("51641728865761437241");
let res = impermanentLoss(
  sqrtPriceCurrent,
  19535,
  21542,
  TickMath.getSqrtRatioAtTick(19535)
);
console.log(res);
