/**
 * Auth Service
 * - MetaMask nonce generation & signature verification
 * - Issue app JWT tokens
 */

import { supabase } from '../config/supabase';
import { getConfig } from '../config/env';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { ethers } from 'ethers';

const config = getConfig();

export class AuthService {
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  static async getOrCreateNonce(walletAddress: string): Promise<{ nonce: string; expiresAt: string } | null> {
    try {
      const nonce = this.generateNonce();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      const { error } = await supabase
        .from('wallet_nonces')
        .upsert({ wallet_address: walletAddress.toLowerCase(), nonce, expires_at: expiresAt, used: false }, {
          onConflict: 'wallet_address'
        });

      if (error) throw error;
      return { nonce, expiresAt };
    } catch (err) {
      logger.error('Error generating nonce:', err);
      return null;
    }
  }

  static async verifySignatureAndIssueToken(
    walletAddress: string,
    signature: string
  ): Promise<{ token: string; userId: string } | null> {
    try {
      // Get nonce for wallet
      const { data: nonceRow, error: nonceError } = await supabase
        .from('wallet_nonces')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (nonceError || !nonceRow) throw new Error('Nonce not found');
      if (nonceRow.used) throw new Error('Nonce already used');
      if (new Date(nonceRow.expires_at).getTime() < Date.now()) throw new Error('Nonce expired');

      // Recover address from signature
      const message = `Sign in to BitArt Market\n\nNonce: ${nonceRow.nonce}`;
      const recovered = ethers.verifyMessage(message, signature);

      if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new Error('Signature does not match wallet');
      }

      // Mark nonce used
      await supabase
        .from('wallet_nonces')
        .update({ used: true })
        .eq('wallet_address', walletAddress.toLowerCase());

      // Upsert user by wallet
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      let userId = userRow?.id;

      if (userError || !userRow) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({ wallet_address: walletAddress.toLowerCase(), role: 'user', verified: false })
          .select('*')
          .single();

        if (createError || !newUser) throw createError || new Error('Failed to create user');
        userId = newUser.id;
      }

      // Issue app JWT
      const token = jwt.sign(
        {
          sub: userId,
          wallet_address: walletAddress.toLowerCase(),
          role: userRow?.role || 'user',
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      return { token, userId };
    } catch (err) {
      logger.error('Error verifying signature:', err);
      return null;
    }
  }
}
