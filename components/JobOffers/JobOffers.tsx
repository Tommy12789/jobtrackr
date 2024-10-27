/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import JobOfferModal from './job-offer-modal';
import { JobOffer } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import JobOffersList from './JobOffersList';
import { SquareArrowOutUpRight } from 'lucide-react';

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

const JobOffers = () => {
  const { toast } = useToast();

  const [selected, setSelected] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('description');
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const [jobOffers, setJobOffers] = useState<JobOffers[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='flex h-full bg-zinc-100 rounded-3xl gap-4 p-4'>
        <div className='relative flex flex-col bg-white w-1/4 max-2xl:w-full h-full rounded-3xl p-4 '>
          <h3 className='text-lg font-semibold text-zinc-700 border-b-2 pb-2 w-full text-center'>{jobOffers.length} job offers</h3>
          <JobOffersList
            jobOffers={jobOffers}
            selected={selected}
            setSelected={setSelected}
            handleDelete={handleDelete}
          />
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
                    src={offer.companyLogo ? offer.companyLogo : '/logo.svg'}
                    alt='Company logo'
                    className={cn('rounded-full size-12 bg-zinc-500 object-contain', { 'bg-white': !offer.companyLogo })}
                  />

                  <p className='text-lg font-normal'>{offer.company}</p>
                </div>
                <div className='flex gap-4 items-center'>
                  <h4 className='text-xl font-bold'>{offer.title}</h4>
                  <a
                    href={offer.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Button variant={'ghost'}>
                      <SquareArrowOutUpRight />
                    </Button>
                  </a>
                </div>
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
                    className={cn('flex-1 rounded-full hover:bg-purple-500 hover:text-zinc-50', {
                      'bg-purple-500 text-zinc-50': selectedTab === 'description',
                    })}
                    variant={'ghost'}
                    onClick={() => setSelectedTab('description')}
                  >
                    Description
                  </Button>
                  <Button
                    className={cn('flex-1 rounded-full hover:bg-purple-500 hover:text-zinc-50', {
                      'bg-purple-500 text-zinc-50': selectedTab === 'coverLetter',
                    })}
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
                    ) : isLoading ? (
                      <div
                        role='status'
                        className='w-full h-[calc(100vh-7rem)] flex items-center justify-center'
                      >
                        <svg
                          aria-hidden='true'
                          className='inline size-14 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600'
                          viewBox='0 0 100 101'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                            fill='currentColor'
                          />
                          <path
                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                            fill='currentFill'
                          />
                        </svg>
                        <span className='sr-only'>Loading...</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleGenerateCoverLetter(offer.url)}
                        variant={'ghost'}
                        className='bg-purple-500 hover:text-zinc-50 hover:bg-purple-400 text-zinc-50'
                      >
                        Generate Cover Letter
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

export default JobOffers;
