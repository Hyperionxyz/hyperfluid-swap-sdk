import { BigintIsh, Currency, CurrencyAmount, Percent, TradeType, validateAndParseAddress } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'
import { Trade } from './entities/trade'
import { ADDRESS_ZERO } from './constants'
import { encodeRouteToPath } from './utils'
import { MethodParameters, toHex } from './utils/calldata'

/**
 * Options for producing the arguments to send calls to the router.
 */
export interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent

  /**
   * The account that should receive the output.
   */
  recipient: string

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * The optional price limit for the trade.
   */
  sqrtPriceLimitX96?: BigintIsh

  /**
   * Optional information for taking a fee on output.
   */
  fee?: FeeOptions
}

/**
 * Represents the Uniswap V3 SwapRouter, and has static methods for helping execute trades.
 */
export abstract class SwapRouter {

  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(
    trades: Trade<Currency, Currency, TradeType> | Trade<Currency, Currency, TradeType>[],
    options: SwapOptions
  ): MethodParameters {
    if (!Array.isArray(trades)) {
      trades = [trades]
    }

    const sampleTrade = trades[0]
    const tokenIn = sampleTrade.inputAmount.currency.wrapped
    const tokenOut = sampleTrade.outputAmount.currency.wrapped

    // All trades should have the same starting and ending token.
    invariant(
      trades.every((trade) => trade.inputAmount.currency.wrapped.equals(tokenIn)),
      'TOKEN_IN_DIFF'
    )
    invariant(
      trades.every((trade) => trade.outputAmount.currency.wrapped.equals(tokenOut)),
      'TOKEN_OUT_DIFF'
    )

    const calldatas: string[] = []

    const ZERO_IN: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(trades[0].inputAmount.currency, 0)
    const ZERO_OUT: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(trades[0].outputAmount.currency, 0)

    const totalAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) => sum.add(trade.minimumAmountOut(options.slippageTolerance)),
      ZERO_OUT
    )

    // flag for whether a refund needs to happen
    const mustRefund = sampleTrade.inputAmount.currency.isNative && sampleTrade.tradeType === TradeType.EXACT_OUTPUT
    const inputIsNative = sampleTrade.inputAmount.currency.isNative
    // flags for whether funds should be send first to the router
    const outputIsNative = sampleTrade.outputAmount.currency.isNative
    const routerMustCustody = outputIsNative || !!options.fee

    const totalValue: CurrencyAmount<Currency> = inputIsNative
      ? trades.reduce((sum, trade) => sum.add(trade.maximumAmountIn(options.slippageTolerance)), ZERO_IN)
      : ZERO_IN


    const recipient: string = validateAndParseAddress(options.recipient)
    const deadline = toHex(options.deadline)

    for (const trade of trades) {
      for (const { route, inputAmount, outputAmount } of trade.swaps) {
        const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient)
        const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient)

        // flag for whether the trade is single hop or not
        const singleHop = route.pools.length === 1

        if (singleHop) {
          if (trade.tradeType === TradeType.EXACT_INPUT) {
            const exactInputSingleParams = {
              tokenIn: route.tokenPath[0].address,
              tokenOut: route.tokenPath[1].address,
              fee: route.pools[0].fee,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountIn,
              amountOutMinimum: amountOut,
              sqrtPriceLimitX96: toHex(options.sqrtPriceLimitX96 ?? 0),
            }

          } else {
            const exactOutputSingleParams = {
              tokenIn: route.tokenPath[0].address,
              tokenOut: route.tokenPath[1].address,
              fee: route.pools[0].fee,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountOut,
              amountInMaximum: amountIn,
              sqrtPriceLimitX96: toHex(options.sqrtPriceLimitX96 ?? 0),
            }

          }
        } else {
          invariant(options.sqrtPriceLimitX96 === undefined, 'MULTIHOP_PRICE_LIMIT')

          const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT)

          if (trade.tradeType === TradeType.EXACT_INPUT) {
            const exactInputParams = {
              path,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountIn,
              amountOutMinimum: amountOut,
            }

          } else {
            const exactOutputParams = {
              path,
              recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
              deadline,
              amountOut,
              amountInMaximum: amountIn,
            }

          }
        }
      }
    }

    // console.log(totalValue)
    // console.log(totalValue.quotient)
    return {
      value: toHex(totalValue.quotient)
    }
  }
}
