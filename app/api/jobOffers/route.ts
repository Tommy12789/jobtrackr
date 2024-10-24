import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Récupérer les offres d'emploi assignées à l'utilisateur avec les détails des offres
    const jobOffersUser = await prisma.userJobOffer.findMany({
      where: { userId: userId },
      include: {
        jobOffer: true,
      },
    });

    console.log(jobOffersUser);

    return NextResponse.json(jobOffersUser, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch job offers' }, { status: 500 });
  }
}
