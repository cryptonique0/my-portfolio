import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure owner can add addresses to whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'add-to-whitelist', [
                types.principal(wallet1.address),
                types.uint(1)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify whitelist status
        let checkBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'is-whitelisted', [
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure non-owner cannot add to whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'add-to-whitelist', [
                types.principal(wallet2.address),
                types.uint(1)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100);
    },
});

Clarinet.test({
    name: "Ensure batch whitelist addition works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'batch-add-to-whitelist', [
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address),
                    types.principal(wallet3.address)
                ]),
                types.uint(2)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify all are whitelisted
        let checkBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'is-whitelisted', [
                types.principal(wallet1.address)
            ], deployer.address),
            Tx.contractCall('whitelist-manager', 'is-whitelisted', [
                types.principal(wallet2.address)
            ], deployer.address),
            Tx.contractCall('whitelist-manager', 'is-whitelisted', [
                types.principal(wallet3.address)
            ], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectBool(true);
        checkBlock.receipts[1].result.expectBool(true);
        checkBlock.receipts[2].result.expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure owner can remove addresses from whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // First add to whitelist
        let addBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'add-to-whitelist', [
                types.principal(wallet1.address),
                types.uint(1)
            ], deployer.address),
        ]);
        
        addBlock.receipts[0].result.expectOk();
        
        // Then remove
        let removeBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'remove-from-whitelist', [
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        removeBlock.receipts[0].result.expectOk();
        
        // Verify removed
        let checkBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'is-whitelisted', [
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        checkBlock.receipts[0].result.expectBool(false);
    },
});

Clarinet.test({
    name: "Ensure tier metadata can be set and retrieved",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'set-tier-metadata', [
                types.uint(5),
                types.ascii("Platinum"),
                types.uint(50000000000)
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Retrieve tier metadata
        let getBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'get-tier-metadata', [
                types.uint(5)
            ], deployer.address),
        ]);
        
        const metadata = getBlock.receipts[0].result.expectSome().expectTuple();
        metadata['tier-name'].expectAscii('Platinum');
        metadata['max-allocation'].expectUint(50000000000);
    },
});

Clarinet.test({
    name: "Ensure whitelist can be activated and deactivated",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // Deactivate
        let deactivateBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'deactivate-whitelist', [], deployer.address),
        ]);
        
        deactivateBlock.receipts[0].result.expectOk();
        
        // Check status
        let statusBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'is-whitelist-active', [], deployer.address),
        ]);
        
        statusBlock.receipts[0].result.expectBool(false);
        
        // Activate
        let activateBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'activate-whitelist', [], deployer.address),
        ]);
        
        activateBlock.receipts[0].result.expectOk();
        
        // Check status again
        let statusBlock2 = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'is-whitelist-active', [], deployer.address),
        ]);
        
        statusBlock2.receipts[0].result.expectBool(true);
    },
});

Clarinet.test({
    name: "Ensure total whitelisted count is tracked correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Add addresses
        let addBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'add-to-whitelist', [
                types.principal(wallet1.address),
                types.uint(1)
            ], deployer.address),
            Tx.contractCall('whitelist-manager', 'add-to-whitelist', [
                types.principal(wallet2.address),
                types.uint(1)
            ], deployer.address),
        ]);
        
        // Check count
        let countBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'get-total-whitelisted', [], deployer.address),
        ]);
        
        countBlock.receipts[0].result.expectUint(2);
        
        // Remove one
        let removeBlock = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'remove-from-whitelist', [
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        // Check count again
        let countBlock2 = chain.mineBlock([
            Tx.contractCall('whitelist-manager', 'get-total-whitelisted', [], deployer.address),
        ]);
        
        countBlock2.receipts[0].result.expectUint(1);
    },
});
