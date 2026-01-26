import { NextRequest, NextResponse } from 'next/server';
import { EmergencyContactsService } from '@/lib/services/emergency-contacts';
import { ethers } from 'ethers';

// POST /api/emergency-contacts/[address]/remove
export async function POST(req: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params;
  const { privateKey } = await req.json();
  if (!address || !privateKey) {
    return NextResponse.json({ success: false, message: 'Address and privateKey required' }, { status: 400 });
  }
  try {
    const provider = EmergencyContactsService.getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    await EmergencyContactsService.removeContact(address, signer);
    return NextResponse.json({ success: true, message: 'Contact removed' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Failed to remove contact' }, { status: 500 });
  }
}
