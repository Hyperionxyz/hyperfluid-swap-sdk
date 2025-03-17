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
  leftBoundaryImpermanentLossRatio: number;
  rightBoundaryImpermanentLossRatio: number;
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
  let originValueAtLeftBoundary = JSBI.ADD(
    JSBI.signedRightShift(
      JSBI.multiply(
        JSBI.BigInt(amountAInput),
        JSBI.exponentiate(upperPrice, JSBI.BigInt(2))
      ),
      JSBI.BigInt(192)
    ),
    amountBInput
  );
  let originValueAtRightBoundary = JSBI.ADD(
    JSBI.signedRightShift(
      JSBI.multiply(
        JSBI.BigInt(amountAInput),
        JSBI.exponentiate(lowerPrice, JSBI.BigInt(2))
      ),
      JSBI.BigInt(192)
    ),
    amountBInput
  );
  let leftBoundaryValue = JSBI.ADD(
    JSBI.multiply(
      JSBI.BigInt(amountALeft),
      JSBI.signedRightShift(
        JSBI.exponentiate(upperPrice, JSBI.BigInt(2)),
        JSBI.BigInt(192)
      )
    ),
    amountBLeft
  );
  let rightBoundaryValue = JSBI.ADD(
    JSBI.multiply(
      JSBI.BigInt(amountARight),
      JSBI.signedRightShift(
        JSBI.exponentiate(lowerPrice, JSBI.BigInt(2)),
        JSBI.BigInt(192)
      )
    ),
    amountBRight
  );
  console.log(originValueAtLeftBoundary.toString());
  console.log(leftBoundaryValue.toString());
  console.log(originValueAtRightBoundary.toString());
  console.log(rightBoundaryValue.toString());
  let leftDiffRatio = JSBI.divide(
    JSBI.leftShift(
      JSBI.subtract(originValueAtLeftBoundary, leftBoundaryValue),
      JSBI.BigInt(64)
    ),
    originValueAtLeftBoundary
  );
  let rightDiffRatio = JSBI.divide(
    JSBI.leftShift(
      JSBI.subtract(originValueAtRightBoundary, rightBoundaryValue),
      JSBI.BigInt(64)
    ),
    originValueAtRightBoundary
  );
  return {
    amountAInput: amountAInput,
    amountBInput: JSBI.BigInt(amountBInput),
    amountALeft,
    amountBLeft,
    amountARight,
    amountBRight,
    leftBoundaryImpermanentLossRatio: jsbiToRatio(leftDiffRatio, 64),
    rightBoundaryImpermanentLossRatio: jsbiToRatio(rightDiffRatio, 64),
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
  leftBoundaryImpermanentLossRatio: number;
  rightBoundaryImpermanentLossRatio: number;
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
  // console.log(liquidityA.toString());
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
  let originValueAtLeftBoundary = JSBI.ADD(
    JSBI.signedRightShift(
      JSBI.multiply(
        JSBI.BigInt(amountAInput),
        JSBI.exponentiate(upperPrice, JSBI.BigInt(2))
      ),
      JSBI.BigInt(192)
    ),
    amountBInput
  );
  let originValueAtRightBoundary = JSBI.ADD(
    JSBI.signedRightShift(
      JSBI.multiply(
        JSBI.BigInt(amountAInput),
        JSBI.exponentiate(lowerPrice, JSBI.BigInt(2))
      ),
      JSBI.BigInt(192)
    ),
    amountBInput
  );
  let leftBoundaryValue = JSBI.ADD(
    JSBI.multiply(
      JSBI.BigInt(amountALeft),
      JSBI.signedRightShift(
        JSBI.exponentiate(upperPrice, JSBI.BigInt(2)),
        JSBI.BigInt(192)
      )
    ),
    amountBLeft
  );
  let rightBoundaryValue = JSBI.ADD(
    JSBI.multiply(
      JSBI.BigInt(amountARight),
      JSBI.signedRightShift(
        JSBI.exponentiate(lowerPrice, JSBI.BigInt(2)),
        JSBI.BigInt(192)
      )
    ),
    amountBRight
  );
  let leftDiffRatio = JSBI.divide(
    JSBI.leftShift(
      JSBI.subtract(originValueAtLeftBoundary, leftBoundaryValue),
      JSBI.BigInt(64)
    ),
    originValueAtLeftBoundary
  );
  let rightDiffRatio = JSBI.divide(
    JSBI.leftShift(
      JSBI.subtract(originValueAtRightBoundary, rightBoundaryValue),
      JSBI.BigInt(64)
    ),
    originValueAtRightBoundary
  );
  return {
    amountAInput: JSBI.BigInt(amountAInput),
    amountBInput,
    amountALeft,
    amountBLeft,
    amountARight,
    amountBRight,
    leftBoundaryImpermanentLossRatio: jsbiToRatio(leftDiffRatio, 64),
    rightBoundaryImpermanentLossRatio: jsbiToRatio(rightDiffRatio, 64),
  };
}

function jsbiToRatio(fixedPoint: JSBI, denominator: number): number {
  return (
    parseFloat(fixedPoint.toString()) /
    parseFloat(
      JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(denominator)).toString()
    )
  );
}

let sqrtPriceFromTick = TickMath.getSqrtRatioAtTick(20000);

export function priceToSqrtPrice(price: number): JSBI {
  return encodeSqrtRatioX96(price * 1000000000, 1000000000);
}

let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("51641728865761437241");
let res = createThenRemoveFromA(sqrtPriceCurrent, 19535, 21542, 100000000);

console.log(res.amountAInput.toString());
console.log(res.amountBInput.toString());
console.log(res.amountALeft.toString());
console.log(res.amountBLeft.toString());
console.log(res.amountARight.toString());
console.log(res.amountBRight.toString());
console.log(res.leftBoundaryImpermanentLossRatio);
console.log(res.rightBoundaryImpermanentLossRatio);
