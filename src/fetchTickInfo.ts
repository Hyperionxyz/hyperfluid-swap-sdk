/*
This is an example snippet - you should consider tailoring it
to your service.

Note: we only handle the first operation here
*/
import fetch from 'node-fetch';

function fetchGraphQL(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>
) {
  return fetch('https://api.hyperfluid.xyz/v1/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: operationsDoc,
      variables,
      operationName,
    },
  ),
  }).then(result => result.json());
}


export function fetchMyQuery(offset, pool_id) {
  let operation = `
    query MyQuery {
      api {
        getPoolTickInfo(offset: ${offset}, poolId: "${pool_id}") {
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
  return fetchGraphQL(operation, 'MyQuery', {})
}

// fetchMyQuery(100, "0xd3894aca06d5f42b27c89e6f448114b3ed6a1ba07f992a58b2126c71dd83c127")
//   .then(({ data, errors }) => {
//     if (errors) {
//       console.error(errors);
//     }
//     console.log(data);
//   })
//   .catch(error => {
//     console.error(error);
//   });
