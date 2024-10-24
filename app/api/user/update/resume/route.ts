import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function PUT(request: Request) {
  console.log('Request:', request);
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const userId = formData.get('userId') as string;

    console.log('File:', file);
    console.log('User ID:', userId);

    if (!file || !userId) {
      return NextResponse.json({ message: 'Aucun fichier PDF trouvé.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);
    const pdfText = data.text;
    console.log('PDF text:', pdfText);

    await prisma.user.update({
      where: { id: userId },
      data: {
        resume: pdfText,
      },
    });

    return NextResponse.json({ message: 'Mise à jour réussie', resumeText: pdfText });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier PDF:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeText = formData.get('resume') as string;
    const userId = formData.get('userId') as string;

    if (!resumeText || !userId) {
      return NextResponse.json({ message: 'userid or resume not found' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        resume: resumeText,
      },
    });

    return NextResponse.json({ message: 'Mise à jour réussie' });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier PDF:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
