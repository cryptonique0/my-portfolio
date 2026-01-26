import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure owner can create vesting schedule",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vesting-schedule', 'create-vesting-schedule', [
                types.principal(wallet1.address),
                types.uint(1000000),
                types.uint(1),
                types.uint(100),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Ensure beneficiary can claim vested tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Create schedule
        let createBlock = chain.mineBlock([
            Tx.contractCall('vesting-schedule', 'create-vesting-schedule', [
                types.principal(wallet1.address),
                types.uint(1000000),
                types.uint(1),
                types.uint(100),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        createBlock.receipts[0].result.expectOk();
        
        // Mine to cliff
        chain.mineEmptyBlocks(100);
        
        // Calculate claimable
        let claimableBlock = chain.mineBlock([
            Tx.contractCall('vesting-schedule', 'get-claimable-amount', [
                types.uint(1),
                types.principal(wallet1.address)
            ], wallet1.address),
        ]);
        
        const claimable = claimableBlock.receipts[0].result.expectUint();
        assertEquals(claimable > 0n, true);
    },
});

Clarinet.test({
    name: "Ensure no tokens vested before cliff",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let createBlock = chain.mineBlock([
            Tx.contractCall('vesting-schedule', 'create-vesting-schedule', [
                types.principal(wallet1.address),
                types.uint(1000000),
                types.uint(1),
                types.uint(100),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Check claimable before cliff (should be 0)
        let claimableBlock = chain.mineBlock([
            Tx.contractCall('vesting-schedule', 'get-claimable-amount', [
                types.uint(1),
                types.principal(wallet1.address)
            ], wallet1.address),
        ]);
        
        claimableBlock.receipts[0].result.expectUint(0);
    },
});
