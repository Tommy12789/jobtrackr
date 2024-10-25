/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import JobOfferModal from './job-offer-modal';
import { JobOffer } from '@prisma/client';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Textarea } from './ui/textarea';

interface JoinedJobOfferUser {
  userId: string;
  jobOffer: JobOffer;
  coverLetter: string;
  status: string;
}

export interface JobOffers {
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  companyLogo: string;
  employmentType: string;
  coverLetter: string;
  status: string;
  slug: string;
}

const JobOffersList = () => {
  const { toast } = useToast();

  const [selected, setSelected] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('description');
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const [jobOffers, setJobOffers] = useState<JobOffers[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const fetchJobOffers = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/jobOffers?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Error fetching job offers');
      }
      const data = await response.json();
      const jobOffers = data.map((joinedOfferUser: JoinedJobOfferUser) => ({
        ...joinedOfferUser.jobOffer,
        coverLetter: joinedOfferUser.coverLetter,
        status: joinedOfferUser.status,
      }));
      setJobOffers(jobOffers);
    } catch (error) {
      console.error('Failed to fetch job offers:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchJobOffers();
    }
  }, [status, userId]);

  const handleDelete = async (url: string) => {
    try {
      const response = await fetch(`/api/jobOffers/delete?url=${url}&userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting job offer');
      }
      setJobOffers((prev) => prev.filter((offer) => offer.url !== url));
      toast({
        title: 'Job offer deleted successfully',
        duration: 5000,
      });
      setSelected('');
    } catch (error) {
      console.error('Failed to delete job offer:', error);
    }
  };

  const handleUpdate = async (url: string, status: string) => {
    try {
      status = jobOffers.find((offer) => offer.url === url)?.status === status ? '' : status;
      const response = await fetch(`/api/jobOffers/update?url=${url}&status=${status}&userId=${userId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Error updating job offer');
      }
      setJobOffers((prev) => prev.map((offer) => (offer.url === url ? { ...offer, status } : offer)));
      toast({
        title: 'Job offer updated successfully',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to update job offer:', error);
    }
  };

  const handleGenerateCoverLetter = async (url: string) => {
    if (!userId) return;
    if (!url) return;
    try {
      const response = await fetch(`/api/jobOffers/generateCoverLetter?url=${url}&userId=${userId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error generating cover letter');
      }

      const data = await response.json();
      const coverLetter = data.coverLetter;
      setJobOffers((prev) => prev.map((offer) => (offer.url === url ? { ...offer, coverLetter: coverLetter } : offer)));
      toast({
        title: 'Cover letter generated successfully',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
    }
  };

  return (
    <>
      <div className='flex h-full bg-zinc-100 rounded-3xl gap-4 p-4'>
        <div className='relative flex flex-col bg-white w-1/4 max-2xl:w-full h-full rounded-3xl p-4 '>
          <h3 className='text-lg font-semibold text-zinc-700 border-b-2 pb-2 w-full text-center'>{jobOffers.length} job offers</h3>
          <ul className='[&_li]:mb-2 mt-4 overflow-y-auto h-[calc(100vh-18rem)] rounded-md'>
            {jobOffers.map((jobOffer: JobOffers) => (
              <>
                <li
                  key={jobOffer.url}
                  className={cn(
                    'max-2xl:hidden gap-3 relative justify-start items-center flex   cursor-pointer hover:bg-zinc-100  rounded-lg px-4 ',
                    {
                      'bg-zinc-100': selected === jobOffer.url,
                    }
                  )}
                  onClick={() => jobOffer.url && setSelected(jobOffer.url)}
                >
                  <div className='flex justify-start items-center gap-2  py-8 w-10/12'>
                    <img
                      src={jobOffer.companyLogo}
                      alt={jobOffer.company}
                      className='size-8 rounded-full bg-zinc-500 object-contain'
                    />
                    <div className='flex flex-col gap-1'>
                      <h4 className='text-md font-semibold text-zinc-700 max-2xl:text-sm'>{jobOffer.title}</h4>
                      <p className='text-sm font-normal max-2xl:text-xs '>{jobOffer.company}</p>
                      <p className='text-sm text-zinc-500 '>{jobOffer.location}</p>
                    </div>
                  </div>

                  <div className='absolute right-2 h-full flex flex-col items-center justify-between pt-2 pb-4'>
                    <Button
                      className=' hover:bg-purple-400'
                      variant={'ghost'}
                      size={'icon'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(jobOffer.url);
                      }}
                    >
                      <X />
                    </Button>

                    {jobOffer.status !== '' && (
                      <div
                        className={cn('rounded-full size-3 ', {
                          'bg-green-400': jobOffer.status === 'interview',
                          'bg-yellow-400': jobOffer.status === 'applied',
                          'bg-red-400': jobOffer.status === 'rejected',
                        })}
                      ></div>
                    )}
                  </div>
                </li>

                <Link href={`/job-offers/${jobOffer.slug}`}>
                  <li
                    key={jobOffer.url}
                    className={cn('2xl:hidden gap-3 relative justify-start items-center flex   cursor-pointer hover:bg-zinc-100  rounded-lg px-4 ', {
                      'bg-zinc-100': selected === jobOffer.url,
                    })}
                    onClick={() => jobOffer.url && setSelected(jobOffer.url)}
                  >
                    <div className='flex justify-start items-center gap-2  py-8 w-10/12'>
                      <img
                        src={jobOffer.companyLogo}
                        alt={jobOffer.company}
                        className='size-8 rounded-full bg-zinc-500 object-contain'
                      />
                      <div className='flex flex-col gap-1'>
                        <h4 className='text-md font-semibold text-zinc-700 max-2xl:text-sm'>{jobOffer.title}</h4>
                        <p className='text-sm font-normal max-2xl:text-xs '>{jobOffer.company}</p>
                        <p className='text-sm text-zinc-500 '>{jobOffer.location}</p>
                      </div>
                    </div>

                    <div className='absolute right-2 h-full flex flex-col items-center justify-between pt-2 pb-4'>
                      <Button
                        className=' hover:bg-purple-400'
                        variant={'ghost'}
                        size={'icon'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(jobOffer.url);
                        }}
                      >
                        <X />
                      </Button>

                      {jobOffer.status !== '' && (
                        <div
                          className={cn('rounded-full size-3 ', {
                            'bg-green-400': jobOffer.status === 'interview',
                            'bg-yellow-400': jobOffer.status === 'applied',
                            'bg-red-400': jobOffer.status === 'rejected',
                          })}
                        ></div>
                      )}
                    </div>
                  </li>
                </Link>
              </>
            ))}
          </ul>
          <div className='absolute bottom-0 right-0 left-0 items-center justify-center flex flex-col pb-4'>
            <Button
              variant={'outline'}
              className='rounded-full'
              onClick={() => setIsOpen(true)}
            >
              Add Job Offer
            </Button>
          </div>
          <JobOfferModal
            setJobOffers={setJobOffers}
            isOpen={isOpen}
            closeModal={closeModal}
          />
        </div>
        <div className='bg-white flex-1 p-6 rounded-3xl max-2xl:hidden'>
          {jobOffers
            .filter((offer) => offer.url === selected)
            .map((offer) => (
              <div
                key={offer.url}
                className='flex flex-col gap-2'
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={offer.companyLogo}
                    alt='Company logo'
                    className='rounded-full size-12 bg-zinc-500 object-contain'
                  />

                  <p className='text-lg font-normal'>{offer.company}</p>
                </div>
                <h4 className='text-xl font-bold'>{offer.title}</h4>
                <p className='text-zinc-500'>{offer.location}</p>
                <p className='text-zinc-500'>{offer.employmentType}</p>
                <div className='flex gap-2 bg-zinc-100 rounded-full p-4 my-4'>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-yellow-200', { 'bg-yellow-200': offer.status === 'applied' })}
                    variant='ghost'
                    onClick={() => handleUpdate(offer.url, 'applied')}
                  >
                    Applied
                  </Button>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-green-200', { 'bg-green-200': offer.status === 'interview' })}
                    variant='ghost'
                    onClick={() => handleUpdate(offer.url, 'interview')}
                  >
                    Interview
                  </Button>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-red-200', { 'bg-red-200': offer.status === 'rejected' })}
                    variant='ghost'
                    onClick={() => handleUpdate(offer.url, 'rejected')}
                  >
                    Rejected
                  </Button>
                </div>
                <div className='flex w-full p-4 gap-4 bg-zinc-100 rounded-full my-4'>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-white', { 'bg-white': selectedTab === 'description' })}
                    variant={'ghost'}
                    onClick={() => setSelectedTab('description')}
                  >
                    Description
                  </Button>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-white', { 'bg-white': selectedTab === 'coverLetter' })}
                    variant={'ghost'}
                    onClick={() => setSelectedTab('coverLetter')}
                  >
                    Cover Letter
                  </Button>
                </div>
                {selectedTab === 'description' ? (
                  <div className='h-[calc(100vh-38rem)] overflow-y-auto rounded-lg py-4'>
                    <div dangerouslySetInnerHTML={{ __html: offer.description }} />
                  </div>
                ) : selectedTab === 'coverLetter' ? (
                  <div className='flex items-center justify-center h-[calc(100vh-38rem)]'>
                    {offer.coverLetter !== '' ? (
                      <Textarea
                        value={offer.coverLetter}
                        className='flex-1 h-full text-start'
                      ></Textarea>
                    ) : (
                      <Button
                        onClick={() => handleGenerateCoverLetter(offer.url)}
                        variant={'outline'}
                      >
                        Generate cover letter
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          {selected === '' && (
            <div className='flex h-full items-center justify-center'>
              <p>Please select a job offer to show its details</p>{' '}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobOffersList;
