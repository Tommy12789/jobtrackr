import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const slug = request.nextUrl.searchParams.get('slug');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Ajoute un check si slug est requis
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  try {
    const jobOffer = await prisma.jobOffer.findFirst({
      where: { slug: slug },
    });

    if (!jobOffer) {
      return NextResponse.json({ error: 'No job offers found' }, { status: 404 });
    }

    const jobOfferUser = await prisma.userJobOffer.findFirst({
      where: { userId: userId, jobOfferId: jobOffer.url },
      include: {
        jobOffer: true,
      },
    });

    if (!jobOfferUser) {
      return NextResponse.json({ error: 'No job offers found for this user' }, { status: 404 });
    }

    console.log('Job offer found:', jobOfferUser);

    return NextResponse.json(jobOfferUser, { status: 200 });
  } catch (error) {
    console.error('Error fetching job offers:', error);
    return NextResponse.json({ error: 'Failed to fetch job offers' }, { status: 500 });
  }
}
