import { PositionLibrary } from "./utils/position";
import { TickMath } from "./utils";
import { SqrtPriceMath } from "./utils";

(async () => {
  // in range
  let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("18442654833342147318");
  let tickLower = -6;
  let tickUpper = -4;
  let amountADesired = 5000000000;
  let amountBDesired = 5000000000;
  let res = PositionLibrary.getLiquidityAmount(
    sqrtPriceCurrent,
    tickLower,
    tickUpper,
    amountADesired,
    amountBDesired
  );
  console.log("expect 6021903621 here, got:", res.toString());
  let { amountA, amountB } = PositionLibrary.getAmountAAndB(
    sqrtPriceCurrent,
    tickLower,
    tickUpper,
    res
  );
  console.log("amountA: ", amountA.toString());
  console.log("amountB: ", amountB.toString());
  // left side
  // tickLower = -5;
  // tickUpper = -4;
  // amountADesired = 5000000000;
  // amountBDesired = 100000000;
  // res = PositionLibrary.getLiquidityAmount(
  //   sqrtPriceCurrent,
  //   tickLower,
  //   tickUpper,
  //   amountADesired,
  //   amountBDesired
  // );
  // console.log("expect 639129122 here, got:", res.toString());
  // let amountRes = PositionLibrary.getAmountAAndB(
  //   sqrtPriceCurrent,
  //   tickLower,
  //   tickUpper,
  //   res
  // );
  // console.log("amountA: ", amountRes.amountA.toString());
  // console.log("amountB: ", amountRes.amountB.toString());

  // // right side
  // tickLower = 21385;
  // tickUpper = 22275;
  // amountADesired = 100000000;
  // amountBDesired = 0;
  // res = PositionLibrary.getLiquidityAmount(
  //   sqrtPriceCurrent,
  //   tickLower,
  //   tickUpper,
  //   amountADesired,
  //   amountBDesired
  // );
  // console.log("expect 6693212295 here, got:", res.toString());
  // amountRes = PositionLibrary.getAmountAAndB(
  //   sqrtPriceCurrent,
  //   tickLower,
  //   tickUpper,
  //   res
  // );
  // console.log("amountA: ", amountRes.amountA.toString());
  // console.log("amountB: ", amountRes.amountB.toString());
})();
