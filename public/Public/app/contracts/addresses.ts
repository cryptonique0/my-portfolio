// Contract addresses for different networks
// Update these after deploying contracts

export const CONTRACT_ADDRESSES = {
  // Base Mainnet (Chain ID: 8453)
  base: {
    chess: process.env.NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessFactory: process.env.NEXT_PUBLIC_CHESS_FACTORY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessAcademy: process.env.NEXT_PUBLIC_CHESS_ACADEMY_ADDRESS as `0x${string}` || '0xd9145CCE52D386f254917e481eB44e9943F39138' as `0x${string}`,
    chessCoach: process.env.NEXT_PUBLIC_CHESS_COACH_ADDRESS as `0x${string}` || '0xd7B63981A38ACEB507354DF5b51945bacbe28414' as `0x${string}`,
    chessPuzzles: process.env.NEXT_PUBLIC_CHESS_PUZZLES_ADDRESS as `0x${string}` || '0x99CF4c4CAE3bA61754Abd22A8de7e8c7ba3C196d' as `0x${string}`,
  },
  // Base Sepolia Testnet (Chain ID: 84532)
  baseSepolia: {
    chess: process.env.NEXT_PUBLIC_CHESS_CONTRACT_ADDRESS_SEPOLIA as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessFactory: process.env.NEXT_PUBLIC_CHESS_FACTORY_ADDRESS_SEPOLIA as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessAcademy: process.env.NEXT_PUBLIC_CHESS_ACADEMY_ADDRESS_SEPOLIA as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessCoach: process.env.NEXT_PUBLIC_CHESS_COACH_ADDRESS_SEPOLIA as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chessPuzzles: process.env.NEXT_PUBLIC_CHESS_PUZZLES_ADDRESS_SEPOLIA as `0x${string}` || '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
} as const;

// Get contract addresses for a specific chain
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case 8453:
      return CONTRACT_ADDRESSES.base;
    case 84532:
      return CONTRACT_ADDRESSES.baseSepolia;
    default:
      // Default to Base Sepolia for development
      return CONTRACT_ADDRESSES.baseSepolia;
  }
}

// Export individual addresses for convenience (defaults to Base Sepolia)
export const CHESS_ACADEMY_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.chessAcademy;
export const CHESS_COACH_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.chessCoach;
export const CHESS_PUZZLES_ADDRESS = CONTRACT_ADDRESSES.baseSepolia.chessPuzzles;
