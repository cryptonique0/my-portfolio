import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that token has correct initial properties",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'get-name', [], deployer.address),
            Tx.contractCall('airdrop-token', 'get-symbol', [], deployer.address),
            Tx.contractCall('airdrop-token', 'get-decimals', [], deployer.address),
            Tx.contractCall('airdrop-token', 'get-total-supply', [], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 4);
        block.receipts[0].result.expectOk().expectAscii('AirStack Token');
        block.receipts[1].result.expectOk().expectAscii('AIRST');
        block.receipts[2].result.expectOk().expectUint(6);
        block.receipts[3].result.expectOk().expectUint(1000000000000000);
    },
});

Clarinet.test({
    name: "Ensure deployer receives initial token supply",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'get-balance', [
                types.principal(deployer.address)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1000000000000000);
    },
});

Clarinet.test({
    name: "Ensure token transfers work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const transferAmount = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'transfer', [
                types.uint(transferAmount),
                types.principal(deployer.address),
                types.principal(wallet1.address),
                types.none()
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify balances
        let balanceBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'get-balance', [
                types.principal(wallet1.address)
            ], deployer.address),
            Tx.contractCall('airdrop-token', 'get-balance', [
                types.principal(deployer.address)
            ], deployer.address),
        ]);
        
        balanceBlock.receipts[0].result.expectOk().expectUint(transferAmount);
        balanceBlock.receipts[1].result.expectOk().expectUint(1000000000000000 - transferAmount);
    },
});

Clarinet.test({
    name: "Ensure only owner can mint tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'mint', [
                types.uint(1000000),
                types.principal(wallet1.address)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100);
        
        // Deployer should be able to mint
        let ownerMintBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'mint', [
                types.uint(1000000),
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        ownerMintBlock.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure users can burn their own tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // First transfer some tokens to wallet1
        let transferBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'transfer', [
                types.uint(1000000),
                types.principal(deployer.address),
                types.principal(wallet1.address),
                types.none()
            ], deployer.address),
        ]);
        
        transferBlock.receipts[0].result.expectOk();
        
        // Now burn tokens
        let burnBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'burn', [
                types.uint(500000)
            ], wallet1.address),
        ]);
        
        burnBlock.receipts[0].result.expectOk();
        
        // Verify balance
        let balanceBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'get-balance', [
                types.principal(wallet1.address)
            ], wallet1.address),
        ]);
        
        balanceBlock.receipts[0].result.expectOk().expectUint(500000);
    },
});

Clarinet.test({
    name: "Ensure token URI can be updated by owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const newUri = "https://new-uri.com/metadata.json";
        
        // Non-owner should not be able to update
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'set-token-uri', [
                types.some(types.utf8(newUri))
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100);
        
        // Owner should be able to update
        let ownerBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'set-token-uri', [
                types.some(types.utf8(newUri))
            ], deployer.address),
        ]);
        
        ownerBlock.receipts[0].result.expectOk();
        
        // Verify new URI
        let uriBlock = chain.mineBlock([
            Tx.contractCall('airdrop-token', 'get-token-uri', [], deployer.address),
        ]);
        
        uriBlock.receipts[0].result.expectOk().expectSome().expectUtf8(newUri);
    },
});
