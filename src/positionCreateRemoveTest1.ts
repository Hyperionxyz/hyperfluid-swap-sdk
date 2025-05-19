import JSBI from "jsbi";
import { encodeSqrtRatioX96, SqrtPriceMath, TickMath } from "./utils";
import { PositionLibrary } from "./utils/position";

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
  //console.log(liquidityB.toString());
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
  liquidityA: JSBI;
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
  //console.log(liquidityA.toString());
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
    liquidityA,
  };
}

let sqrtPriceFromTick = TickMath.getSqrtRatioAtTick(-28135);

export function priceToSqrtPrice(price: number): JSBI {
  return encodeSqrtRatioX96(Math.floor(price * 1000000000), 1000000000);
}

let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("51641728865761437241");
let res = createThenRemoveFromA(sqrtPriceFromTick, -28333, -27937, 83300000000);
/*
console.log(res.amountAInput.toString());
console.log(res.amountBInput.toString());
console.log(res.amountALeft.toString());
console.log(res.amountBLeft.toString());
console.log(res.amountARight.toString());
console.log(res.amountBRight.toString());
*/

//const usd = [5000];

const offset = [
  0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.2, 0.3, 0.4, 0.5,
  0.6,
];
//const offset = [0.02];

for (const o of offset) {
  const low = 6 / (1 + o);
  const high = 6 * (1 + o);

  console.log();

  console.log(low, high);

  const walletU = 10000;

  const aptPrice = 6;
  const lpU = walletU / 2;
  const lpAPT = (walletU - lpU) / aptPrice;

  const lowTick = Math.round(Math.log(low / 100) / Math.log(1.0001));
  const highTick = Math.round(Math.log(high / 100) / Math.log(1.0001));

  let res = createThenRemoveFromA(
    sqrtPriceFromTick,
    lowTick,
    highTick,
    Math.floor(lpAPT * 10 ** 8)
  );

  const allUSD = res.amountBLeft.toString();
  const allAPT = res.amountARight.toString();
  const lp = res.liquidityA;
  const aptInput = res.amountAInput;

  let highPriceNet = 0;
  let highCurrentInput = aptInput;
  for (let i = 1; i <= 20; i++) {
    const priceStep = (o / 20) * i * aptPrice;
    let newPrice = priceStep + aptPrice;
    if (newPrice > high) {
      newPrice = high;
    }

    const upperPrice = TickMath.getSqrtRatioAtTick(highTick);

    const amountAInput = SqrtPriceMath.getAmount0Delta(
      priceToSqrtPrice(newPrice / 100),
      upperPrice,
      lp,
      false
    );

    const newPriceInput = JSBI.subtract(highCurrentInput, amountAInput);
    const newPriceInputD = Number(newPriceInput.toString()) / 10 ** 8;

    highPriceNet -= newPriceInputD * (newPrice - aptPrice);

    highCurrentInput = amountAInput;
  }

  let lowPriceNet = 0;
  let lowCurrentInput = aptInput;
  for (let i = 1; i <= 20; i++) {
    const priceStep = (o / 20) * i * aptPrice;
    let newPrice = aptPrice - priceStep;
    if (newPrice < low) {
      newPrice = low;
    }

    const upperPrice = TickMath.getSqrtRatioAtTick(highTick);

    const amountAInput = SqrtPriceMath.getAmount0Delta(
      priceToSqrtPrice(newPrice / 100),
      upperPrice,
      lp,
      false
    );

    console.log(amountAInput.toString(), lowCurrentInput.toString());
    const newPriceInput = JSBI.subtract(amountAInput, lowCurrentInput);
    const newPriceInputD = Number(newPriceInput.toString()) / 10 ** 8;

    //console.log(newPriceInputD, newPrice);

    lowPriceNet += newPriceInputD * (newPrice - low);

    lowCurrentInput = amountAInput;
  }

  lowPriceNet += (o * Number(aptInput.toString()) * aptPrice) / 10 ** 8;

  const usdValue = Number(res.amountBInput.toString()) / 10 ** 6;
  const aptValue = (Number(res.amountAInput.toString()) / 10 ** 8) * aptPrice;
  const inputValue = Math.floor(aptValue + usdValue);

  //console.log(inputValue);

  /*
  console.log(
    res.amountAInput.toString(),
    res.amountBInput.toString(),
    allUSD,
    allAPT
  );
  */
  /*
  const upValue = Number(allUSD) / 10 ** 6 - lendingAPT * high + u;
  const downValue = (Number(allAPT) / 10 ** 8 - lendingAPT) * low + u;
  */
  const upValue = Number(allUSD) / 10 ** 6;
  const downValue = (Number(allAPT) / 10 ** 8) * low;
  //console.log(upValue, downValue);

  console.log(`offset: ${o}`);
  console.log(`aptValue: ${aptValue}`);
  console.log(`usdValue: ${usdValue}`);
  console.log(`inputValue: ${inputValue}`);
  console.log(`upValue: ${upValue}`);
  console.log(`downValue: ${downValue}`);
  console.log(`perpValue: ${aptValue * o}`);
  console.log(`upPNL: ${Math.floor(upValue) - inputValue - aptValue * o}`);
  console.log(`downPNL: ${Math.floor(downValue) - inputValue + aptValue * o}`);
  console.log(`highPriceNet: ${highPriceNet}`);
  console.log(`lowPriceNet: ${lowPriceNet}`);
  console.log(`upPNLNew: ${Math.floor(upValue) - inputValue + highPriceNet}`);
  console.log(
    `downPNLNew: ${Math.floor(downValue) - inputValue + lowPriceNet}`
  );

  /*
  console.log(
    aptValue,
    usdValue,
    inputValue,
    Math.floor(upValue),
    Math.floor(downValue),
    aptValue * o,
    Math.floor(upValue) - inputValue - aptValue * o,
    Math.floor(downValue) - inputValue + aptValue * o
    
  );
  */
}
