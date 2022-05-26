export function getLinkedMaskIdFromAChain(chain: string): number {
  return parseInt(chain.split('->')[1])
}
