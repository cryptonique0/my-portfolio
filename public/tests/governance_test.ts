import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure owner can create governance proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // First mint governance tokens
        let mintBlock = chain.mineBlock([
            Tx.contractCall('governance', 'mint-governance-tokens', [
                types.uint(1000),
                types.principal(deployer.address)
            ], deployer.address),
        ]);
        
        mintBlock.receipts[0].result.expectOk();
        
        // Create proposal
        let proposeBlock = chain.mineBlock([
            Tx.contractCall('governance', 'create-proposal', [
                types.ascii('Increase Airdrop Fund'),
                types.ascii('Proposal to increase the total airdrop fund for more participants'),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        proposeBlock.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Ensure users can vote on proposals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup
        let setupBlock = chain.mineBlock([
            Tx.contractCall('governance', 'mint-governance-tokens', [
                types.uint(1000),
                types.principal(deployer.address)
            ], deployer.address),
            Tx.contractCall('governance', 'mint-governance-tokens', [
                types.uint(500),
                types.principal(wallet1.address)
            ], deployer.address),
        ]);
        
        // Create proposal
        let proposeBlock = chain.mineBlock([
            Tx.contractCall('governance', 'create-proposal', [
                types.ascii('Test Proposal'),
                types.ascii('Testing voting functionality'),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Vote yes
        let voteBlock1 = chain.mineBlock([
            Tx.contractCall('governance', 'vote-on-proposal', [
                types.uint(1),
                types.bool(true)
            ], deployer.address),
        ]);
        
        voteBlock1.receipts[0].result.expectOk();
        
        // Vote no
        let voteBlock2 = chain.mineBlock([
            Tx.contractCall('governance', 'vote-on-proposal', [
                types.uint(1),
                types.bool(false)
            ], wallet1.address),
        ]);
        
        voteBlock2.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure user cannot vote twice on same proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        // Setup and create proposal
        let setupBlock = chain.mineBlock([
            Tx.contractCall('governance', 'mint-governance-tokens', [
                types.uint(1000),
                types.principal(deployer.address)
            ], deployer.address),
            Tx.contractCall('governance', 'create-proposal', [
                types.ascii('Test Proposal'),
                types.ascii('Testing voting functionality'),
                types.uint(1000)
            ], deployer.address),
        ]);
        
        // Vote first time
        let voteBlock1 = chain.mineBlock([
            Tx.contractCall('governance', 'vote-on-proposal', [
                types.uint(1),
                types.bool(true)
            ], deployer.address),
        ]);
        
        voteBlock1.receipts[0].result.expectOk();
        
        // Try to vote again (should fail)
        let voteBlock2 = chain.mineBlock([
            Tx.contractCall('governance', 'vote-on-proposal', [
                types.uint(1),
                types.bool(true)
            ], deployer.address),
        ]);
        
        voteBlock2.receipts[0].result.expectErr().expectUint(102);
    },
});
