import JSBI from "jsbi";
import { subIn256 } from ".";
import { TickMath } from "./tickMath";
import { SqrtPriceMath } from "./sqrtPriceMath";
import { Tick } from "src/entities";

const Q128 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128));

export abstract class PositionLibrary {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  // replicates the portions of Position#update required to compute unaccounted fees
  public static getTokensOwed(
    feeGrowthInside0LastX128: JSBI,
    feeGrowthInside1LastX128: JSBI,
    liquidity: JSBI,
    feeGrowthInside0X128: JSBI,
    feeGrowthInside1X128: JSBI
  ) {
    const tokensOwed0 = JSBI.divide(
      JSBI.multiply(
        subIn256(feeGrowthInside0X128, feeGrowthInside0LastX128),
        liquidity
      ),
      Q128
    );

    const tokensOwed1 = JSBI.divide(
      JSBI.multiply(
        subIn256(feeGrowthInside1X128, feeGrowthInside1LastX128),
        liquidity
      ),
      Q128
    );

    return [tokensOwed0, tokensOwed1];
  }

  public static getLiquidityAmount(
    sqrtPriceCurrent: JSBI,
    tickLower: number,
    tickUpper: number,
    amountADesired: number,
    amountBDesired: number
  ): JSBI {
    let lowerPrice = TickMath.getSqrtRatioAtTick(tickLower);
    let upperPrice = TickMath.getSqrtRatioAtTick(tickUpper);
    let res = JSBI.BigInt(0);
    if (JSBI.lessThanOrEqual(sqrtPriceCurrent, lowerPrice)) {
      res = SqrtPriceMath.getLiquidityFromA(
        lowerPrice,
        upperPrice,
        JSBI.BigInt(amountADesired),
        true
      );
    } else if (JSBI.LT(sqrtPriceCurrent, upperPrice)) {
      let liquidityA = SqrtPriceMath.getLiquidityFromA(
        sqrtPriceCurrent,
        upperPrice,
        JSBI.BigInt(amountADesired),
        true
      );
      let liquidityB = SqrtPriceMath.getLiquidityFromB(
        lowerPrice,
        sqrtPriceCurrent,
        JSBI.BigInt(amountBDesired),
        true
      );
      if (liquidityA <= liquidityB) {
        res = liquidityA;
      } else {
        res = liquidityB;
      }
    } else {
      res = SqrtPriceMath.getLiquidityFromB(
        lowerPrice,
        upperPrice,
        JSBI.BigInt(amountBDesired),
        true
      );
    }
    return res;
  }

  public static getAmountAAndB(
    sqrtPriceCurrent: JSBI,
    tickLower: number,
    tickUpper: number,
    liquidity: JSBI
  ): Readonly<{ amountA: JSBI; amountB: JSBI }> {
    let lowerPrice = TickMath.getSqrtRatioAtTick(tickLower);
    let upperPrice = TickMath.getSqrtRatioAtTick(tickUpper);
    let amountA = JSBI.BigInt(0);
    let amountB = JSBI.BigInt(0);
    if (JSBI.lessThanOrEqual(sqrtPriceCurrent, lowerPrice)) {
      amountA = SqrtPriceMath.getAmount0Delta(
        lowerPrice,
        upperPrice,
        liquidity,
        false
      );
    } else if (JSBI.LT(sqrtPriceCurrent, upperPrice)) {
      amountA = SqrtPriceMath.getAmount0Delta(
        sqrtPriceCurrent,
        upperPrice,
        liquidity,
        false
      );
      amountB = SqrtPriceMath.getAmount1Delta(
        lowerPrice,
        sqrtPriceCurrent,
        liquidity,
        false
      );
    } else {
      amountB = SqrtPriceMath.getAmount1Delta(
        lowerPrice,
        upperPrice,
        liquidity,
        false
      );
    }
    return { amountA, amountB };
  }
}
