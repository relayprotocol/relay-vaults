// ABOUTME: Pure helper that derives nativeBridgeStatus from a bridge_transaction's hash columns.
// ABOUTME: Single source of truth used by every handler that writes to the row, so the stored value never regresses.

export type NativeBridgeStatus =
  | 'INITIATED'
  | 'HANDLED'
  | 'PROVEN'
  | 'FINALIZED'

export interface NativeBridgeStatusInputs {
  nativeBridgeFinalizedTxHash?: `0x${string}` | null
  finalizationTimestamp?: bigint | null
  opProofTxHash?: `0x${string}` | null
  loanEmittedTxHash?: `0x${string}` | null
}

// The protocol's state machine progresses INITIATED -> HANDLED -> PROVEN -> FINALIZED.
// The presence of a hash field is the durable on-chain evidence that the matching transition fired,
// so we always pick the highest reached state regardless of write ordering in the indexer.
export const computeNativeBridgeStatus = (
  inputs: NativeBridgeStatusInputs
): NativeBridgeStatus => {
  if (inputs.nativeBridgeFinalizedTxHash || inputs.finalizationTimestamp) {
    return 'FINALIZED'
  }
  if (inputs.opProofTxHash) {
    return 'PROVEN'
  }
  if (inputs.loanEmittedTxHash) {
    return 'HANDLED'
  }
  return 'INITIATED'
}
