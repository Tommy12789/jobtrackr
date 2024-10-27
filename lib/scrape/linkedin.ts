import * as cheerio from 'cheerio';
import { now } from 'next-auth/client/_utils';

export const scrapeLinkedInJobOffer = async (html: string) => {
  const $ = cheerio.load(html);
  const title = $('h1').text();
  const company = $('a[class="topcard__org-name-link topcard__flavor--black-link"]').text().trim();
  const location = $('span[class="sub-nav-cta__meta-text"]').text().trim();
  const description = $('div[class="description__text description__text--rich"]').text().trim().replace('Show more', '').replace('Show less', '');
  const datePosted = $('time[class_="main-job-card__listdate"]').attr('datetime');
  const companyLogo = $('img[class="artdeco-entity-image artdeco-entity-image--square-5"]').attr('data-delayed-url');
  const employmentType = $('span[class="job-criteria__text job-criteria__text--criteria"]').text();
  const job_offer = {
    title,
    company,
    location,
    description,
    datePosted: datePosted ? new Date(datePosted) : new Date(now()),
    companyLogo,
    employmentType,
    slug: '',
    url: '',
    userId: '',
  };

  return job_offer;
};
