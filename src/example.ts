import { CurrencyAmount, Token, TradeType, WETH9 } from '@uniswap/sdk-core'
import { FeeAmount, TICK_SPACINGS } from './constants'
import { Pool } from './entities/pool'
import { nearestUsableTick, TickMath } from './utils'
import { encodeSqrtRatioX96 } from './utils/encodeSqrtRatioX96'
import { Route, Tick, Trade } from './entities'

(async () => {

    const token0 = new Token(1, '0x0000000000000000000000000000000000000001', 8, 't0', 'token0')
    const token1 = new Token(1, '0x0000000000000000000000000000000000000002', 6, 't1', 'token1')

    const feeAmount = FeeAmount.LOWEST
    const sqrtRatioX96 = encodeSqrtRatioX96(854250, 100000)
    const liquidity = 58060639092
    const WETH = WETH9[1]

    const makePool = (token0: Token, token1: Token) => {
        return new Pool(token0, token1, feeAmount, sqrtRatioX96, liquidity, 21451, [
        {
            index: 20149,
            liquidityNet: 3880027,
            liquidityGross: 3880027,
        },
        {
            index: 20397,
            liquidityNet: 6913923992,
            liquidityGross: 6913923992,
        },
        {
            index: 20938,
            liquidityNet: 1353851523,
            liquidityGross: 1353851523,
        },
        {
            index: 21450,
            liquidityNet: -1353851523,
            liquidityGross: 1353851523,
        },
        {
            index: 21948,
            liquidityNet:6790815862 ,
            liquidityGross: 6798575916,
        },
        {
            index: 22404,
            liquidityNet: -6913923992,
            liquidityGross: 6913923992,
        },
        {
            index: 22514,
            liquidityNet: 262923399486,
            liquidityGross: 262923399486,
        },
        {
            index: 23514,
            liquidityNet: -262923399486,
            liquidityGross: 262923399486,
        },
        {
            index: 23955,
            liquidityNet: -6794695889,
            liquidityGross: 6794695889,
        },
        ])
    }

    const pool_0_1 = makePool(token0, token1)

    const trade = await Trade.fromRoute(
        new Route([pool_0_1], token0, token1),
        CurrencyAmount.fromRawAmount(token0, 1000),
        TradeType.EXACT_INPUT
    )

    // expect 8533 output here
    console.log(trade.outputAmount.quotient.toString())

})()