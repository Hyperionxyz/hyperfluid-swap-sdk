/*
This is an example snippet - you should consider tailoring it
to your service.

Note: we only handle the first operation here
*/
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

function fetchGraphQL(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>
) {
  const apiUrl = process.env.HYPERFLUID_API;
  if (!apiUrl) {
    throw new Error("HYPERFLUID_API environment variable is not defined");
  }
  return fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    }),
  }).then((result) => result.json());
}

export function fetchPoolTickInfo(offset, pool_id) {
  let operation = `
    query MyQuery {
      api {
        getPoolTickInfo(offset: ${offset}, poolId: "${pool_id}") {
          poolId
          feeRate
          activeLPAmount
          currentTick
          sqrtPrice
          ticks {
            index
            liquidityGross
            liquidityNet
          }
        }
      }
    }
  `;
  return fetchGraphQL(operation, "MyQuery", {});
}
