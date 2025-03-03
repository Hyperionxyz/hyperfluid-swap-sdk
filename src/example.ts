import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { FeeAmount } from './constants'
import { Pool } from './entities/pool'
import { Route, Trade } from './entities'
import { fetchMyQuery } from './fetchTickInfo'
import JSBI from 'jsbi'

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

    // calc swap token_b to token_a when give a exact output
    const b2aExactOutput = await Trade.fromRoute(
        new Route([pool_0_1], token1, token0),
        CurrencyAmount.fromRawAmount(token0, 10000000), // 10 usdt
        TradeType.EXACT_OUTPUT
    )

    // calc swap token_a to token_b when give a exact input 
    const a2bExactInput = await Trade.fromRoute(
        new Route([pool_0_1], token0, token1),
        CurrencyAmount.fromRawAmount(token0, 10000000), // 10 usdt
        TradeType.EXACT_INPUT
    )

    console.log("how-much-output-when-a2b-exact-input: ", a2bExactInput.outputAmount.quotient.toString())
    console.log("how-much-input-when-b2a-exact-output: ", b2aExactOutput.inputAmount.quotient.toString())

}

(async () => {
    setInterval(async ()=>{
        await main()
    }, 5000);
})()