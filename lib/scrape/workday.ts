import * as cheerio from 'cheerio';

export const scrapeWorkdayJobOffer = async (html: string) => {
  const $ = cheerio.load(html);

  const script = $('script[type="application/ld+json"]').html();
  const data = script ? JSON.parse(script) : null;
  const company = data.hiringOrganization.name;
  const title = data.identifier.name;
  const datePosted = data.datePosted;
  const employmentType = data.employmentType;
  const description = data.description;
  const companyLogo = $('meta[property="og:image"]').attr('content');

  const location = data.jobLocation.address.addressLocality + ', ' + data.jobLocation.address.addressCountry;
  const job_offer = {
    title,
    company,
    location,
    description,
    datePosted: new Date(datePosted),
    companyLogo,
    employmentType,
    slug: '',
    url: '',
    userId: '',
  };

  return job_offer;
};
