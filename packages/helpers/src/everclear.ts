export interface NewIntentParams {
  origin: string
  destinations: string[] // dest chain
  to: string
  inputAsset: string
  amount: string | bigint
  callData: string
  maxFee: string | bigint
  permit2Params?: {
    deadline: string
    nonce: string
    signature: string
  }
  order_id?: string
}

export interface NewIntentResponse {
  to: string
  data: string
  value: string
  chainId: number
}

const EVERCLEAR_API_URL = 'https://api.everclear.org/intents'

// Using everclear API to generate TransactionRequest for a newIntent
export async function getNewEverclearIntent(
  params: NewIntentParams
): Promise<NewIntentResponse> {
  const response = await fetch(EVERCLEAR_API_URL, {
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const json = await response.json()
  if (response.status >= 400) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}: ${JSON.stringify(json)}`
    )
  }

  return json
}
