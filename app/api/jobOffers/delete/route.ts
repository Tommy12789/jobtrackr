import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!url || !userId) {
    return NextResponse.json({ error: 'url and userId are required' }, { status: 400 });
  }

  try {
    await prisma.userJobOffer.delete({
      where: {
        userId_jobOfferId: {
          userId: userId,
          jobOfferId: url,
        },
      },
    });

    const remainingAssociations = await prisma.userJobOffer.count({
      where: {
        jobOfferId: url,
      },
    });

    if (remainingAssociations === 0) {
      await prisma.jobOffer.delete({
        where: {
          url: url,
        },
      });
    }

    return NextResponse.json({ message: `Association and job offer deleted successfully if no other users were linked.` }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete the association or job offer' }, { status: 500 });
  }
}
