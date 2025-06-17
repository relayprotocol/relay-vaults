export interface L2Status {
  isUp: boolean
  lastProofBlock?: number
  lastProofTimestamp?: number
  timeSinceLastProof?: number
  error?: string
}
