/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NETWORK: string;
  readonly VITE_STACKS_API_URL: string;
  readonly VITE_NFT_CONTRACT: string;
  readonly VITE_MARKETPLACE_CONTRACT: string;
  readonly VITE_AUCTION_CONTRACT: string;
  readonly VITE_BASE_RPC_URL: string;
  readonly VITE_BASE_CHAIN_ID: string;
  readonly VITE_BASE_CHAIN_NAME: string;
  readonly VITE_BASE_CURRENCY: string;
  readonly VITE_BASE_EXPLORER: string;
  readonly VITE_BASE_NFT_CONTRACT: string;
  readonly VITE_BASE_MARKETPLACE_CONTRACT: string;
  readonly VITE_BASE_AUCTION_CONTRACT: string;
  readonly VITE_ENABLE_BASE: string;
  readonly VITE_ENABLE_STACKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
