import { BigintIsh } from "@uniswap/sdk-core";
import { TickList } from "../utils/tickList";
import { Tick, TickConstructorArgs } from "./tick";
import { TickDataProvider } from "./tickDataProvider";
import JSBI from "jsbi";

/**
 * A data provider for ticks that is backed by an in-memory array of ticks.
 */
export class TickListDataProvider implements TickDataProvider {
  private ticks: Tick[];

  constructor(ticks: (Tick | TickConstructorArgs)[], tickSpacing: number) {
    const ticksMapped: Tick[] = ticks.map((t) =>
      t instanceof Tick ? t : new Tick(t)
    );
    TickList.validateList(ticksMapped, tickSpacing);
    this.ticks = ticksMapped;
  }

  async getTick(
    tick: number
  ): Promise<{ liquidityNet: BigintIsh; liquidityGross: BigintIsh }> {
    return TickList.getTick(this.ticks, tick);
  }

  async setTick(tick: number, liquidityGross: JSBI, liquidityNet: JSBI) {
    let new_ticks = TickList.setTick(
      this.ticks,
      tick,
      liquidityGross,
      liquidityNet
    );
    console.log(new_ticks);
    this.ticks = new_ticks;
  }

  async nextInitializedTickWithinOneWord(
    tick: number,
    lte: boolean,
    tickSpacing: number
  ): Promise<[number, boolean]> {
    return TickList.nextInitializedTickWithinOneWord(
      this.ticks,
      tick,
      lte,
      tickSpacing
    );
  }
}
