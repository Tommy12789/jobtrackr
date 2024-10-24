import slugify from 'slugify';
import { prisma } from './prisma';

export async function generateUniqueSlug(title: string): Promise<string> {
  const slug = slugify(title, { lower: true });
  let uniqueSlug = slug;
  let count = 1;

  let existingJob = await prisma.jobOffer.findUnique({
    where: { slug: uniqueSlug },
  });

  while (existingJob) {
    uniqueSlug = `${slug}-${count}`;
    count++;
    existingJob = await prisma.jobOffer.findUnique({
      where: { slug: uniqueSlug },
    });
  }

  return uniqueSlug;
}
