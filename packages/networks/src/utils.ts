/**
 * Creates an RPC configuration array with fallback URLs
 * @param chainId - The chain ID to get RPC URLs for
 * @param defaultUrls - Default RPC URLs to use as fallback
 * @returns Array of RPC URLs with environment variables taking precedence
 */
export function createRpcConfig(
  chainId: number | string,
  defaultUrls: string[] = []
): [string, ...string[]] {
  const envList = (process.env[`RPC_${chainId}`] || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)

  return [...envList, ...defaultUrls] as [string, ...string[]]
}
