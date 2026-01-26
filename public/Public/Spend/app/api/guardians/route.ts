import { NextResponse } from 'next/server';
import { GuardianSignatureDB } from '@/lib/services/guardian-signature-db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tokenAddress = url.searchParams.get('tokenAddress');

    console.log('[/api/guardians] GET request for tokenAddress:', tokenAddress);
    
    if (!tokenAddress) {
      return NextResponse.json({ error: 'tokenAddress query parameter is required' }, { status: 400 });
    }

    // Try to fetch guardians by tokenAddress (which could be guardian token or vault address)
    let guardians = await GuardianSignatureDB.getGuardiansByTokenAddress(tokenAddress);
    console.log('[/api/guardians] Retrieved', guardians?.length || 0, 'guardians by tokenAddress');
    
    // If no guardians found and tokenAddress looks like a vault address, also check pending requests
    if ((!guardians || guardians.length === 0) && tokenAddress.startsWith('0x')) {
      console.log('[/api/guardians] No guardians found by tokenAddress, checking pending requests...');
      // This could be a vault address - fetch pending requests and extract unique guardians
      try {
        const allRequests = await GuardianSignatureDB.getPendingRequests();
        const vaultRequests = allRequests.filter((req: any) => req.vaultAddress?.toLowerCase() === tokenAddress.toLowerCase());
        console.log('[/api/guardians] Found', vaultRequests.length, 'pending requests for vault');
        
        // Extract unique guardians from all pending requests for this vault
        const uniqueGuardians = new Set<string>();
        vaultRequests.forEach((req: any) => {
          if (Array.isArray(req.guardians)) {
            req.guardians.forEach((g: string) => uniqueGuardians.add(g.toLowerCase()));
          }
        });
        
        if (uniqueGuardians.size > 0) {
          guardians = Array.from(uniqueGuardians).map((addr: string) => ({
            address: addr,
            tokenId: '0',
            addedAt: Date.now(),
            blockNumber: '0',
            txHash: '0x0',
            tokenAddress: tokenAddress.toLowerCase(),
          }));
          console.log('[/api/guardians] Found', guardians.length, 'unique guardians from pending requests');
        }
      } catch (e) {
        console.error('[/api/guardians] Error checking pending requests:', e);
        console.error('[/api/guardians] Error details:', e instanceof Error ? e.stack : String(e));
      }
    }
    
    console.log('[/api/guardians] Returning', guardians?.length || 0, 'guardians');
    return NextResponse.json(guardians || []);
  } catch (err) {
    console.error('[/api/guardians] Error:', err);
    console.error('[/api/guardians] Error details:', err instanceof Error ? err.stack : String(err));
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage, stack: err instanceof Error ? err.stack : undefined }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.address || !body.tokenId || !body.tokenAddress) {
      return NextResponse.json({ error: 'Invalid body - missing required fields' }, { status: 400 });
    }

    await GuardianSignatureDB.saveGuardian(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/guardians] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
