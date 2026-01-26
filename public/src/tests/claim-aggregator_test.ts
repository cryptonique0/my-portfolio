import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure aggregate claim works with valid merkle proofs",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup: Create airdrop and register merkle root
        let setupBlock = chain.mineBlock([
            // Create airdrop in airdrop-manager
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(1000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            // Register merkle root
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(1))
            ], deployer.address),
        ]);
        
        setupBlock.receipts[0].result.expectOk().expectUint(1);
        setupBlock.receipts[1].result.expectOk().expectUint(1);
        
        // Create claim data
        const leaf = types.buff(new Uint8Array(32).fill(2));
        const proof = types.list([types.buff(new Uint8Array(32).fill(3))]);
        
        // Aggregate claim
        let claimBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list([
                    types.tuple({
                        'airdrop-id': types.uint(1),
                        'amount': types.uint(100000),
                        'merkle-root-id': types.uint(1),
                        'leaf': leaf,
                        'proof': proof
                    })
                ])
            ], wallet1.address),
        ]);
        
        claimBlock.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure double-claim prevention works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(1000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(1))
            ], deployer.address),
        ]);
        
        const leaf = types.buff(new Uint8Array(32).fill(2));
        const proof = types.list([types.buff(new Uint8Array(32).fill(3))]);
        
        const claimData = types.list([
            types.tuple({
                'airdrop-id': types.uint(1),
                'amount': types.uint(100000),
                'merkle-root-id': types.uint(1),
                'leaf': leaf,
                'proof': proof
            })
        ]);
        
        // First claim
        let firstClaim = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [claimData], wallet1.address),
        ]);
        
        firstClaim.receipts[0].result.expectOk();
        
        // Second claim should fail
        let secondClaim = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [claimData], wallet1.address),
        ]);
        
        secondClaim.receipts[0].result.expectErr().expectUint(204);
    },
});

Clarinet.test({
    name: "Ensure multiple claims in single transaction works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup multiple airdrops and merkle roots
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(1000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(2000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(1))
            ], deployer.address),
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(2))
            ], deployer.address),
        ]);
        
        // Multiple claims
        let claimBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list([
                    types.tuple({
                        'airdrop-id': types.uint(1),
                        'amount': types.uint(100000),
                        'merkle-root-id': types.uint(1),
                        'leaf': types.buff(new Uint8Array(32).fill(10)),
                        'proof': types.list([types.buff(new Uint8Array(32).fill(11))])
                    }),
                    types.tuple({
                        'airdrop-id': types.uint(2),
                        'amount': types.uint(200000),
                        'merkle-root-id': types.uint(2),
                        'leaf': types.buff(new Uint8Array(32).fill(20)),
                        'proof': types.list([types.buff(new Uint8Array(32).fill(21))])
                    })
                ])
            ], wallet1.address),
        ]);
        
        claimBlock.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Ensure too many claims are rejected",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Create 21 claims (max is 20)
        const claims = [];
        for (let i = 0; i < 21; i++) {
            claims.push(types.tuple({
                'airdrop-id': types.uint(1),
                'amount': types.uint(100000),
                'merkle-root-id': types.uint(1),
                'leaf': types.buff(new Uint8Array(32).fill(i)),
                'proof': types.list([types.buff(new Uint8Array(32).fill(i + 1))])
            }));
        }
        
        let block = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list(claims)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(208);
    },
});

Clarinet.test({
    name: "Ensure paused aggregator rejects claims",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Pause aggregator
        let pauseBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'pause-aggregator', [], deployer.address),
        ]);
        
        pauseBlock.receipts[0].result.expectOk();
        
        // Try to claim
        let claimBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list([
                    types.tuple({
                        'airdrop-id': types.uint(1),
                        'amount': types.uint(100000),
                        'merkle-root-id': types.uint(1),
                        'leaf': types.buff(new Uint8Array(32).fill(1)),
                        'proof': types.list([types.buff(new Uint8Array(32).fill(2))])
                    })
                ])
            ], wallet1.address),
        ]);
        
        claimBlock.receipts[0].result.expectErr().expectUint(201);
    },
});

Clarinet.test({
    name: "Ensure claim status can be queried",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup and claim
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(1000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(1))
            ], deployer.address),
        ]);
        
        let claimBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list([
                    types.tuple({
                        'airdrop-id': types.uint(1),
                        'amount': types.uint(100000),
                        'merkle-root-id': types.uint(1),
                        'leaf': types.buff(new Uint8Array(32).fill(2)),
                        'proof': types.list([types.buff(new Uint8Array(32).fill(3))])
                    })
                ])
            ], wallet1.address),
        ]);
        
        // Query claim status
        let statusBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'get-claim-status', [
                types.principal(wallet1.address),
                types.uint(1),
                types.uint(1)
            ], wallet1.address),
        ]);
        
        const status = statusBlock.receipts[0].result.expectSome().expectTuple();
        status['claimed'].expectBool(true);
        status['amount'].expectUint(100000);
    },
});

Clarinet.test({
    name: "Ensure only owner can pause/unpause",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'pause-aggregator', [], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(200);
    },
});

Clarinet.test({
    name: "Ensure global statistics are tracked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Setup
        let setupBlock = chain.mineBlock([
            Tx.contractCall('airdrop-manager', 'create-airdrop', [
                types.principal(`${deployer.address}.airdrop-token`),
                types.uint(1000000000),
                types.uint(1),
                types.uint(10000)
            ], deployer.address),
            Tx.contractCall('merkle-tree', 'register-merkle-root', [
                types.buff(new Uint8Array(32).fill(1))
            ], deployer.address),
        ]);
        
        // Claim
        let claimBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'aggregate-claim', [
                types.list([
                    types.tuple({
                        'airdrop-id': types.uint(1),
                        'amount': types.uint(100000),
                        'merkle-root-id': types.uint(1),
                        'leaf': types.buff(new Uint8Array(32).fill(2)),
                        'proof': types.list([types.buff(new Uint8Array(32).fill(3))])
                    })
                ])
            ], wallet1.address),
        ]);
        
        // Check stats
        let statsBlock = chain.mineBlock([
            Tx.contractCall('claim-aggregator', 'get-total-claims-processed', [], wallet1.address),
            Tx.contractCall('claim-aggregator', 'get-total-tokens-distributed', [], wallet1.address),
        ]);
        
        statsBlock.receipts[0].result.expectOk().expectUint(1);
        statsBlock.receipts[1].result.expectOk().expectUint(100000);
    },
});
