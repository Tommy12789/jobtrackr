import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const status = request.nextUrl.searchParams.get('status');
  const userId = request.nextUrl.searchParams.get('userId'); // Ajouter l'userId

  if (!url || !userId) {
    return NextResponse.json({ error: 'url and userId are required' }, { status: 400 });
  }

  try {
    await prisma.userJobOffer.update({
      where: {
        userId_jobOfferId: {
          userId: userId,
          jobOfferId: url,
        },
      },
      data: {
        status: status || '',
      },
    });

    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update job offer status' }, { status: 500 });
  }
}
