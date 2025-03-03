import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { FeeAmount, TICK_SPACINGS } from './constants'
import { Pool } from './entities/pool'
import { nearestUsableTick, TickMath } from './utils'
import { encodeSqrtRatioX96 } from './utils/encodeSqrtRatioX96'
import { Route, Tick, Trade } from './entities'
import { fetchMyQuery } from './fetchTickInfo'
import { getAmountOut, getAmountIn } from './viewGetAmount'
import JSBI from 'jsbi'

async function main() {

    const viewAmountOut = await getAmountOut(
        '0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127', 
        '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b', 
        10000000
    )

    const viewAmountIn = await getAmountIn(
        '0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127', 
        '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b', 
        10000000
    )

    const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 6, 't0', 'token0')
    const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 6, 't1', 'token1')

    let a: any = await fetchMyQuery(100, "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127");
    const poolInfo = a.data.api.getPoolTickInfo;

    const feeAmount = FeeAmount.LOWEST
    const sqrtRatioX96 = JSBI.leftShift(JSBI.BigInt(poolInfo.sqrtPrice), JSBI.BigInt(32))
    const liquidity = poolInfo.activeLPAmount;
    const currentTick = poolInfo.currentTick;
    let ticks = poolInfo.ticks;
    ticks.sort((n1, n2) => n1.index - n2.index)

    const makePool = (token0: Token, token1: Token) => {
        return new Pool(token0, token1, feeAmount, sqrtRatioX96, liquidity, currentTick, ticks)
    }

    const pool_0_1 = makePool(token0, token1)

    const b2aExactOutput = await Trade.fromRoute(
        new Route([pool_0_1], token1, token0),
        CurrencyAmount.fromRawAmount(token0, 10000000),
        TradeType.EXACT_OUTPUT
    )

    const a2bExactInput = await Trade.fromRoute(
        new Route([pool_0_1], token0, token1),
        CurrencyAmount.fromRawAmount(token0, 10000000),
        TradeType.EXACT_INPUT
    )

    console.log("a2b-exact-input-delta: ", parseInt(viewAmountOut?.toString() as any) - parseInt(a2bExactInput.outputAmount.quotient.toString()))
    console.log("b2a-exact-output-delta: ", parseInt(viewAmountIn?.toString() as any) - parseInt(b2aExactOutput.inputAmount.quotient.toString()))

}

(async () => {
    setInterval(async ()=>{
        await main()
    }, 5000);
})()