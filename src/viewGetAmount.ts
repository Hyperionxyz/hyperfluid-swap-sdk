import {Aptos, InputViewFunctionData, AptosConfig, Network} from "@aptos-labs/ts-sdk" 

export async function getAmountOut(poolId, fromToken, amountIn) {
const config = new AptosConfig({ network: Network.MAINNET });
    const aptos = new Aptos(config);
    const payload: InputViewFunctionData = {
        function: "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::pool_v3::get_amount_out",
        functionArguments: [
            poolId,
            fromToken,
            amountIn
        ]
    };
    
    const res = (await aptos.view({ payload }))[0];
    return res

}

export async function getAmountIn(poolId, toToken, amountOut) {
const config = new AptosConfig({ network: Network.MAINNET });
    const aptos = new Aptos(config);
    const payload: InputViewFunctionData = {
        function: "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::pool_v3::get_amount_in",
        functionArguments: [
            poolId,
            toToken,
            amountOut
        ]
    };
    
    const res = (await aptos.view({ payload }))[0];
    return res

}
