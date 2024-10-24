import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function PUT(request: NextRequest) {
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

    const updatedRecord = await prisma.user.update({
      where: { id: userId },
      data: {
        resume: pdfText,
      },
    });

    return NextResponse.json({ message: 'Mise à jour réussie', record: updatedRecord });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier PDF:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
