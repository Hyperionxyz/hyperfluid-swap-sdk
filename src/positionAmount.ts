import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { FeeAmount } from './constants'
import { Pool } from './entities/pool'
import { Route, Trade } from './entities'
import { fetchMyQuery } from './fetchTickInfo'
import {Position} from './entities/position'
import JSBI from 'jsbi'
import { getPositionTokenAmount } from './viewPositionAmount'

async function main() {

    const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 6, 't0', 'token0')
    const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 6, 't1', 'token1')

    // fetch pool tick infos.
    // fetchMyQuery take two params.
    // first one is tick offset, it declares how much offset from current tick u want both side.
    // second one is pool id (pool object address).
    // when give offset 0, it means return all the available ticks.
    let a: any = await fetchMyQuery(100, "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127");
    const poolInfo = a.data.api.getPoolTickInfo;

    const feeAmount = FeeAmount.LOWEST
    const sqrtRatioX96 = JSBI.leftShift(JSBI.BigInt(poolInfo.sqrtPrice), JSBI.BigInt(32))
    const liquidity = poolInfo.activeLPAmount;
    const currentTick = poolInfo.currentTick;
    let ticks = poolInfo.ticks;

    const makePool = (token0: Token, token1: Token) => {
        return new Pool(token0, token1, feeAmount, sqrtRatioX96, liquidity, currentTick, ticks)
    }

    // initialize pool state
    const pool_0_1 = makePool(token0, token1)

    // position: 0x0fe3ff5cd457fd3ae2368bb043b9ab0e6d351f0d8f9201a41f9d37c8aa5e71b9
    const viewAmount = await getPositionTokenAmount('0x0fe3ff5cd457fd3ae2368bb043b9ab0e6d351f0d8f9201a41f9d37c8aa5e71b9')
    console.log(viewAmount)
    
    const position_1 = new Position({pool: pool_0_1, tickLower: -172, tickUpper: 227, liquidity: JSBI.BigInt(6703590075653)});

    console.log(position_1.amount0.numerator.toString())
    console.log(position_1.amount1.numerator.toString())


}

(async () => {
    await main()
})()