// ABOUTME: Covers the monotonic-by-evidence rule for nativeBridgeStatus, including the LoanEmitted-after-WithdrawalProven regression.
// ABOUTME: The protocol observed this regression in production after the Aave outage of 2026-04, when delayed Hyperlane retries clobbered already-PROVEN rows.

import { describe, expect, it } from 'vitest'
import { computeNativeBridgeStatus } from '../src/utils/nativeBridgeStatus.js'

const LOAN = '0xaa' as const
const PROOF = '0xbb' as const
const FINALIZE = '0xcc' as const

describe('computeNativeBridgeStatus', () => {
  it('returns INITIATED when no hash is set', () => {
    expect(computeNativeBridgeStatus({})).toBe('INITIATED')
  })

  it('returns HANDLED when only loanEmittedTxHash is set', () => {
    expect(computeNativeBridgeStatus({ loanEmittedTxHash: LOAN })).toBe(
      'HANDLED'
    )
  })

  it('returns PROVEN when only opProofTxHash is set', () => {
    expect(computeNativeBridgeStatus({ opProofTxHash: PROOF })).toBe('PROVEN')
  })

  it('returns FINALIZED when nativeBridgeFinalizedTxHash is set', () => {
    expect(
      computeNativeBridgeStatus({ nativeBridgeFinalizedTxHash: FINALIZE })
    ).toBe('FINALIZED')
  })

  it('returns FINALIZED when only finalizationTimestamp is set (zksync path)', () => {
    expect(computeNativeBridgeStatus({ finalizationTimestamp: 1n })).toBe(
      'FINALIZED'
    )
  })

  // Guards against truthiness-based checks: a hypothetical 0n timestamp must
  // still count as evidence that finalization fired.
  it('returns FINALIZED for a 0n finalizationTimestamp', () => {
    expect(computeNativeBridgeStatus({ finalizationTimestamp: 0n })).toBe(
      'FINALIZED'
    )
  })

  it('PROVEN beats HANDLED — both hashes set', () => {
    expect(
      computeNativeBridgeStatus({
        loanEmittedTxHash: LOAN,
        opProofTxHash: PROOF,
      })
    ).toBe('PROVEN')
  })

  it('FINALIZED beats every earlier state', () => {
    expect(
      computeNativeBridgeStatus({
        loanEmittedTxHash: LOAN,
        nativeBridgeFinalizedTxHash: FINALIZE,
        opProofTxHash: PROOF,
      })
    ).toBe('FINALIZED')
  })

  // The Aave-outage regression: a row was PROVEN, then days later Hyperlane
  // finally delivered and LoanEmitted fired. Recomputing from the merged hash
  // set must keep the row at PROVEN, not regress to HANDLED.
  it('does not regress PROVEN to HANDLED when a late LoanEmitted arrives', () => {
    const existing = { opProofTxHash: PROOF }
    const merged = { ...existing, loanEmittedTxHash: LOAN }
    expect(computeNativeBridgeStatus(merged)).toBe('PROVEN')
  })

  it('does not regress FINALIZED to HANDLED when a late LoanEmitted arrives', () => {
    const existing = {
      nativeBridgeFinalizedTxHash: FINALIZE,
      opProofTxHash: PROOF,
    }
    const merged = { ...existing, loanEmittedTxHash: LOAN }
    expect(computeNativeBridgeStatus(merged)).toBe('FINALIZED')
  })

  it('treats explicit nulls the same as missing fields', () => {
    expect(
      computeNativeBridgeStatus({
        finalizationTimestamp: null,
        loanEmittedTxHash: null,
        nativeBridgeFinalizedTxHash: null,
        opProofTxHash: null,
      })
    ).toBe('INITIATED')
  })
})
