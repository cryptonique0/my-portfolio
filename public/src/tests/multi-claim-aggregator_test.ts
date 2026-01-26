import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure user can claim from single whitelist airdrop",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'claim-from-whitelist-airdrop', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify claim tracking
        let checkBlock = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'has-claimed-campaign', [
                types.principal(wallet1.address),
                types.ascii('whitelist'),
                types.uint(1)
            ], wallet1.address),
        ]);
        
        checkBlock.receipts[0].result.expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure user cannot double-claim from same campaign",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First claim
        let firstClaim = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'claim-from-whitelist-airdrop', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        firstClaim.receipts[0].result.expectOk();
        
        // Second claim should fail
        let secondClaim = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'claim-from-whitelist-airdrop', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        secondClaim.receipts[0].result.expectErr().expectUint(103);
    },
});

Clarinet.test({
    name: "Ensure aggregate multi-claim works with multiple campaigns",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Create dummy merkle proof
        const dummyLeaf = '0x0000000000000000000000000000000000000000000000000000000000000001';
        const dummyProof = '0x0000000000000000000000000000000000000000000000000000000000000002';
        
        let block = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'aggregate-multi-claim', [
                types.list([types.uint(1), types.uint(2)]), // whitelist airdrops
                types.list([]), // no merkle claims for this test
                types.list([types.uint(1)]) // vesting schedules
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(3); // 3 total campaigns
        
        // Verify aggregated claim was recorded
        let checkBlock = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'get-aggregated-claim', [
                types.principal(wallet1.address),
                types.uint(block.height)
            ], wallet1.address),
        ]);
        
        const claimData = checkBlock.receipts[0].result.expectSome().expectTuple();
        claimData['campaigns-count'].expectUint(3);
        claimData['completed'].expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure too many claims in one tx is rejected",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Try to claim from 11 campaigns (max is 10)
        let block = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'aggregate-multi-claim', [
                types.list([
                    types.uint(1), types.uint(2), types.uint(3), types.uint(4), 
                    types.uint(5), types.uint(6), types.uint(7), types.uint(8),
                    types.uint(9), types.uint(10), types.uint(11)
                ]),
                types.list([]),
                types.list([])
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "Ensure aggregator can be deactivated and reactivated",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Deactivate
        let deactivate = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'deactivate-aggregator', [], deployer.address),
        ]);
        
        deactivate.receipts[0].result.expectOk();
        
        // Try to claim while deactivated
        let claimFail = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'claim-from-whitelist-airdrop', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimFail.receipts[0].result.expectErr().expectUint(101);
        
        // Reactivate
        let activate = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'activate-aggregator', [], deployer.address),
        ]);
        
        activate.receipts[0].result.expectOk();
        
        // Claim should work now
        let claimSuccess = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'claim-from-whitelist-airdrop', [
                types.uint(1)
            ], wallet1.address),
        ]);
        
        claimSuccess.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure only owner can activate/deactivate aggregator",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('multi-claim-aggregator', 'deactivate-aggregator', [], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100);
    },
});
