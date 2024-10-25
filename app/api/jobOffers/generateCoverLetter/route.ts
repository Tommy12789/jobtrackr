import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const userId = request.nextUrl.searchParams.get('userId');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (!url || !userId) {
    return new Response('URL parameter is missing', { status: 400 });
  }

  try {
    const userJobOffer = await prisma.userJobOffer.findUnique({
      where: {
        userId_jobOfferId: {
          userId,
          jobOfferId: url,
        },
      },
      include: {
        jobOffer: true,
        user: true,
      },
    });

    if (!userJobOffer) {
      return new Response('Job offer not found', { status: 404 });
    }

    const promptContent = `
      Write a cover letter for the job offer titled "${userJobOffer.jobOffer.title}" at ${userJobOffer.jobOffer.company} and description : ${userJobOffer.jobOffer.description}.
      Here are details about the user:

      - Name: ${userJobOffer.user.first_name} ${userJobOffer.user.last_name}
      - address: ${userJobOffer.user.address}
      - zip: ${userJobOffer.user.zip}
      - city: ${userJobOffer.user.city}
      - Phone: ${userJobOffer.user.phone}
      - Country: ${userJobOffer.user.country}
      - Resume: ${userJobOffer.user.resume}
      
      The user is applying for this role and would like the letter to highlight their experience, skills, and enthusiasm for the position.
      fill all the informations, don't put any placeholder.
      also fill the date

      ne le fais pas en markdown, je veux le texte brut avec les sauts de ligne etc mais sans caractères spéciaux

      Format the letter professionally and include an introductory paragraph, body paragraphs with specific examples from the user's background, and a closing paragraph.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional assistant helping to write a cover letter.' },
        { role: 'user', content: promptContent },
      ],
    });

    console.log(completion.choices[0].message.content);

    await prisma.userJobOffer.update({
      where: {
        userId_jobOfferId: {
          userId,
          jobOfferId: url,
        },
      },
      data: {
        coverLetter: completion.choices[0].message.content as string,
      },
    });

    return new Response(JSON.stringify({ message: 'Cover letter generated successfully', coverLetter: completion.choices[0].message.content }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'An error occurred while generating the cover letter', error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
