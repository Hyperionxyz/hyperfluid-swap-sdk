import {PositionLibrary} from './utils/position'
import { TickMath } from './utils';
import { SqrtPriceMath } from './utils';

(async () => {
    // in range
    let sqrtPriceCurrent = SqrtPriceMath.getSqrtPrice("51641728865761437241") 
    let tickLower = 19535;
    let tickUpper = 21542;
    let amountADesired = 100000000;
    let amountBDesired = 866085879;
    let res = PositionLibrary.getLiquidityAmount(
        sqrtPriceCurrent,
        tickLower,
        tickUpper,
        amountADesired,
        amountBDesired
    );
    console.log("expect 6021903621 here, got:" , res.toString())
    // left side
    tickLower = 18845;
    tickUpper = 20029;
    amountADesired = 0;
    amountBDesired = 100000000;
    res = PositionLibrary.getLiquidityAmount(
        sqrtPriceCurrent,
        tickLower,
        tickUpper,
        amountADesired,
        amountBDesired
    );
    console.log("expect 639129122 here, got:" , res.toString())

    // right side
    tickLower = 21385;
    tickUpper = 22275;
    amountADesired = 100000000;
    amountBDesired = 0;
    res = PositionLibrary.getLiquidityAmount(
        sqrtPriceCurrent,
        tickLower,
        tickUpper,
        amountADesired,
        amountBDesired
    );
    console.log("expect 6693212295 here, got:" , res.toString())

})()