import { prisma } from '@/lib/prisma';
import { scrapeWorkdayJobOffer } from '@/lib/scrape/workday';
import { NextRequest } from 'next/server';
import { generateUniqueSlug } from '@/lib/slug';
import { scrapeLinkedInJobOffer } from '@/lib/scrape/linkedin';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!url || !userId) {
    return new Response('URL parameter is missing', { status: 400 });
  }

  let res: Response | undefined;

  for (let i = 0; i < 5; i++) {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36',
      },
    });
    if (res.ok) {
      break;
    }
    console.log('Failed to fetch HTML, retrying in 1 second');
    await new Promise((resolve) => setTimeout(resolve, 1000 * i));
  }

  if (!res || !res.ok) {
    return new Response('Failed to fetch HTML', { status: res ? res.status : 500 });
  }

  const website = url.split('/')[2];
  const html = await res.text();

  let job_offer: {
    url: string;
    title: string;
    company: string;
    location: string | undefined;
    description: string;
    datePosted: Date;
    companyLogo: string | undefined;
    employmentType: string;
    userId: string;
    slug?: string;
  };

  if (website.includes('workday')) {
    job_offer = await scrapeWorkdayJobOffer(html);
  } else if (website.includes('linkedin')) {
    job_offer = await scrapeLinkedInJobOffer(html);
  } else {
    return new Response('Website not supported', { status: 400 });
  }

  const slug = await generateUniqueSlug(job_offer['title']);

  job_offer['slug'] = slug;
  job_offer['userId'] = userId;
  job_offer['url'] = url;

  const existingJobOffer = await prisma.jobOffer.findUnique({
    where: { url },
  });

  if (existingJobOffer) {
    const existingAssociation = await prisma.userJobOffer.findUnique({
      where: {
        userId_jobOfferId: {
          userId,
          jobOfferId: url,
        },
      },
    });

    if (existingAssociation) {
      return new Response('User already linked to this job offer', { status: 400, statusText: 'User already linked to this job offer' });
    }

    await prisma.userJobOffer.create({
      data: {
        userId,
        jobOfferId: url,
        coverLetter: '',
      },
    });
  } else {
    await prisma.jobOffer.create({
      data: {
        url: job_offer.url,
        title: job_offer.title,
        company: job_offer.company,
        location: job_offer.location || '',
        slug,
        description: job_offer.description || '',
        datePosted: job_offer.datePosted,
        companyLogo: job_offer.companyLogo || '',
        employmentType: job_offer.employmentType,
        users: {
          create: { userId },
        },
      },
    });
  }

  return new Response(JSON.stringify(job_offer), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
