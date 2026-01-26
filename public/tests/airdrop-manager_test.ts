import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure owner can create airdrop",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Ensure non-owner cannot create airdrop",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        let block = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100);
    },
});

Clarinet.test({
    name: "Ensure owner can set allocation for recipient",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // First create airdrop
        let createBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        createBlock.receipts[0].result.expectOk();
        
        // Set allocation
        let setBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'set-allocation', [
                types.uint(1),
                types.principal(wallet1.address),
                types.uint(5000000)
            ], deployer.address),
        ]);
        
        setBlock.receipts[0].result.expectOk();
        
        // Verify allocation
        let getAllocBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'get-allocation', [
                types.uint(1),
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        getAllocBlock.receipts[0].result.expectUint(5000000);
    },
});

Clarinet.test({
    name: "Ensure batch allocation works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Create airdrop
        let createBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Batch set allocations
        let batchBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'batch-set-allocations', [
                types.uint(1),
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address),
                    types.principal(wallet3.address)
                ]),
                types.list([
                    types.uint(1000000),
                    types.uint(2000000),
                    types.uint(3000000)
                ])
            ], deployer.address),
        ]);
        
        batchBlock.receipts[0].result.expectOk();
        
        // Verify allocations
        let verifyBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'get-allocation', [
                types.uint(1),
                types.principal(wallet1.address)
            ], deployer.address),
            Tx.contractCall('airdrop-manager', 'get-allocation', [
                types.uint(1),
                types.principal(wallet2.address)
            ], deployer.address),
            Tx.contractCall('airdrop-manager', 'get-allocation', [
                types.uint(1),
                types.principal(wallet3.address)
            ], deployer.address),
        ]);
        
        verifyBlock.receipts[0].result.expectUint(1000000);
        verifyBlock.receipts[1].result.expectUint(2000000);
        verifyBlock.receipts[2].result.expectUint(3000000);
    },
});

Clarinet.test({
    name: "Ensure user can claim tokens with allocation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Create airdrop
        let createBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Set allocation
        let setBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'set-allocation', [
                types.uint(1),
                types.principal(wallet1.address),
                types.uint(5000000)
            ], deployer.address),
        ]);
        
        // Claim tokens
        let claimBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock.receipts[0].result.expectOk().expectUint(5000000);
        
        // Verify claim status
        let statusBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'has-claimed', [
                types.uint(1),
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        const claimInfo = statusBlock.receipts[0].result.expectTuple();
        claimInfo['claimed'].expectBool(true);
        claimInfo['amount'].expectUint(5000000);
    },
});

Clarinet.test({
    name: "Ensure user cannot claim twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Create airdrop and set allocation
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        let allocBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'set-allocation', [
                types.uint(1),
                types.principal(wallet1.address),
                types.uint(5000000)
            ], deployer.address),
        ]);
        
        // First claim
        let claimBlock1 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock1.receipts[0].result.expectOk();
        
        // Second claim should fail
        let claimBlock2 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock2.receipts[0].result.expectErr().expectUint(102);
    },
});

Clarinet.test({
    name: "Ensure user cannot claim without allocation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Create airdrop without setting allocation
        let createBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Try to claim
        let claimBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock.receipts[0].result.expectErr().expectUint(101);
    },
});

Clarinet.test({
    name: "Ensure owner can pause and unpause contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Setup
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        let allocBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'set-allocation', [
                types.uint(1),
                types.principal(wallet1.address),
                types.uint(5000000)
            ], deployer.address),
        ]);
        
        // Pause
        let pauseBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'pause-contract', [], deployer.address),
        ]);
        
        pauseBlock.receipts[0].result.expectOk();
        
        // Try to claim while paused
        let claimBlock1 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock1.receipts[0].result.expectErr().expectUint(107);
        
        // Unpause
        let unpauseBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'unpause-contract', [], deployer.address),
        ]);
        
        unpauseBlock.receipts[0].result.expectOk();
        
        // Claim should work now
        let claimBlock2 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'claim-tokens', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimBlock2.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure owner can activate and deactivate airdrop",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const tokenContract = `${deployer.address}.airdrop-token`;
        
        // Create airdrop
        let createBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(tokenContract),
                types.uint(1000000000),
                types.uint(1),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Deactivate
        let deactivateBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'deactivate-airdrop', [
                types.uint(1)
            ], deployer.address),
        ]);
        
        deactivateBlock.receipts[0].result.expectOk();
        
        // Check if active
        let checkBlock1 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'is-airdrop-active', [
                types.uint(1)
            ], deployer.address),
        ]);
        
        checkBlock1.receipts[0].result.expectBool(false);
        
        // Activate
        let activateBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'activate-airdrop', [
                types.uint(1)
            ], deployer.address),
        ]);
        
        activateBlock.receipts[0].result.expectOk();
        
        // Check if active again
        let checkBlock2 = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'is-airdrop-active', [
                types.uint(1)
            ], deployer.address),
        ]);
        
        checkBlock2.receipts[0].result.expectBool(true);
    },
});
