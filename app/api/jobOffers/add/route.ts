import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
import { NextRequest } from 'next/server';
import { generateUniqueSlug } from '@/lib/slug';

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
  console.log(website);
  const html = await res.text();
  const $ = cheerio.load(html);

  let company, title, datePosted, employmentType, description, location, companyLogo;

  if (website.includes('workday')) {
    console.log('workday');
    const script = $('script[type="application/ld+json"]').html();
    const data = script ? JSON.parse(script) : null;
    company = data.hiringOrganization.name;
    title = data.identifier.name;
    datePosted = data.datePosted;
    employmentType = data.employmentType;
    description = data.description;
    companyLogo = $('meta[property="og:image"]').attr('content');
    location = data.jobLocation.address.addressLocality + ', ' + data.jobLocation.address.addressCountry;
  } else if (website.includes('linkedin')) {
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    return new Response('Website not supported', { status: 400 });
  }

  const slug = await generateUniqueSlug(title);

  const job_offer = {
    url,
    title,
    company,
    location,
    description,
    slug,
    datePosted: new Date(datePosted),
    companyLogo,
    employmentType,
    userId,
  };

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
        url,
        title,
        company,
        location,
        slug,
        description,
        datePosted: new Date(datePosted),
        companyLogo: companyLogo || 'test',
        employmentType,
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
