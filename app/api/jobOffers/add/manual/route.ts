import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug';
import { now } from 'next-auth/client/_utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('URL:', request);

  const jsonData = await request.json();
  console.log('JSON:', jsonData);
  const url = jsonData.link_manual;

  const userId = request.nextUrl.searchParams.get('userId'); // Ajouter l'userId

  if (!userId || !url) {
    return NextResponse.json({ error: 'url and userId are required' }, { status: 400 });
  }

  const slug = await generateUniqueSlug(jsonData.position);

  const jobOffer = {
    url,
    title: jsonData.position,
    company: jsonData.companyName,
    location: jsonData.location,
    description: jsonData.description,
    datePosted: new Date(now()),
    companyLogo: '',
    employmentType: jsonData.employment_type,
    coverLetter: '',
    status: '',
    slug,
  };

  try {
    await prisma.jobOffer.create({
      data: {
        url,
        title: jsonData.position,
        company: jsonData.companyName,
        location: jsonData.location,
        slug,
        description: jsonData.description,
        datePosted: new Date(now()),
        companyLogo: '',
        employmentType: jsonData.employment_type,
        users: {
          create: { userId },
        },
      },
    });

    return NextResponse.json({ message: 'Status updated successfully', jobOffer }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update job offer status' }, { status: 500 });
  }
}
