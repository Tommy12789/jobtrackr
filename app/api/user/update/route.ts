import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const firstName = request.nextUrl.searchParams.get('firstName');
  const lastName = request.nextUrl.searchParams.get('lastName');
  const phoneNumber = request.nextUrl.searchParams.get('phoneNumber');
  const address = request.nextUrl.searchParams.get('address');
  const zip = request.nextUrl.searchParams.get('zip');
  const city = request.nextUrl.searchParams.get('city');
  const country = request.nextUrl.searchParams.get('country');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        first_name: firstName || '',
        last_name: lastName || '',
        phone: phoneNumber || '',
        address: address || '',
        zip: zip || '',
        city: city || '',
        country: country || '',
      },
    });

    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update job offer status' }, { status: 500 });
  }
}
