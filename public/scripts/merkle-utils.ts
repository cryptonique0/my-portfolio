// Utility for generating Merkle tree proofs
// Used for efficient airdrop verification

import * as crypto from 'https://deno.land/std@0.208.0/crypto/mod.ts';

export interface MerkleNode {
  hash: Buffer;
  left?: MerkleNode;
  right?: MerkleNode;
}

export class MerkleTree {
  private leaves: Buffer[];
  private tree: MerkleNode[];

  constructor(data: string[]) {
    this.leaves = data.map(item => {
      return Buffer.from(crypto.subtle.digestSync('sha-256', new TextEncoder().encode(item)));
    });
    this.tree = [];
    this.buildTree();
  }

  private buildTree(): void {
    if (this.leaves.length === 0) {
      return;
    }

    let nodes: MerkleNode[] = this.leaves.map(leaf => ({
      hash: leaf,
    }));

    while (nodes.length > 1) {
      const newLevel: MerkleNode[] = [];

      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1] || nodes[i];

        const combined = Buffer.concat([left.hash, right.hash]);
        const hash = Buffer.from(crypto.subtle.digestSync('sha-256', combined));

        newLevel.push({
          hash,
          left,
          right,
        });
      }

      nodes = newLevel;
    }

    this.tree = nodes;
  }

  getRoot(): Buffer {
    return this.tree.length > 0 ? this.tree[0].hash : Buffer.alloc(0);
  }

  getProof(leafIndex: number): Buffer[] {
    if (leafIndex >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }

    const proof: Buffer[] = [];
    let nodeIndex = leafIndex;
    let nodes = this.leaves.map(leaf => ({ hash: leaf }));

    while (nodes.length > 1) {
      const newLevel: MerkleNode[] = [];

      for (let i = 0; i < nodes.length; i += 2) {
        const left = nodes[i];
        const right = nodes[i + 1] || nodes[i];

        if (i === nodeIndex || i + 1 === nodeIndex) {
          if (nodeIndex === i) {
            proof.push(right.hash);
          } else {
            proof.push(left.hash);
          }
        }

        const combined = Buffer.concat([left.hash, right.hash]);
        const hash = Buffer.from(crypto.subtle.digestSync('sha-256', combined));

        newLevel.push({
          hash,
          left,
          right,
        });
      }

      nodeIndex = Math.floor(nodeIndex / 2);
      nodes = newLevel;
    }

    return proof;
  }

  verify(leaf: Buffer, proof: Buffer[]): boolean {
    let hash = leaf;

    for (const proofItem of proof) {
      const combined = Buffer.concat([hash, proofItem]);
      hash = Buffer.from(crypto.subtle.digestSync('sha-256', combined));
    }

    return hash.equals(this.getRoot());
  }
}

// Example usage
export function generateMerkleTree(recipients: string[]): {
  root: string;
  proofs: Map<string, string[]>;
} {
  const tree = new MerkleTree(recipients);
  const root = tree.getRoot().toString('hex');
  const proofs = new Map<string, string[]>();

  recipients.forEach((recipient, index) => {
    const proof = tree.getProof(index);
    proofs.set(recipient, proof.map(p => p.toString('hex')));
  });

  return { root, proofs };
}
