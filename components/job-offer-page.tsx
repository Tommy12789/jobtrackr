'use client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';

interface JobOffer {
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

const JobOfferPage = () => {
  const toast = useToast();
  const slug = usePathname().split('/')[2];
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [selectedTab, setSelectedTab] = useState('description');

  const fetchJobOffers = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/jobOffers/findOne?userId=${userId}&slug=${slug}`);
      if (!response.ok) {
        throw new Error('Error fetching job offers');
      }
      const data = await response.json();
      console.log('Job offer fetched:', data);
      const jobOffer_ = { ...data.jobOffer, coverLetter: data.coverLetter, status: data.status };

      setJobOffer(jobOffer_);
    } catch (error) {
      console.error('Failed to fetch job offers:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchJobOffers();
    }
  }, [userId, status]);

  useEffect(() => {
    console.log('Job offer state:', jobOffer);
  }, [jobOffer]);

  const handleUpdate = async (url: string, status: string) => {
    try {
      status = jobOffer?.status === status ? '' : status;
      const response = await fetch(`/api/jobOffers/update?url=${url}&status=${status}&userId=${userId}`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Error updating job offer');
      }
      setJobOffer((prev) => (prev ? { ...prev, status } : null));
      toast.toast({
        title: 'Job offer updated successfully',
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to update job offer:', error);
    }
  };

  return (
    <div>
      {jobOffer !== null ? (
        <>
          <h2 className='text-2xl font-semibold text-zinc-700 border-b-2 pb-4'>{jobOffer.title}</h2>

          <div className='bg-white flex-1 p-6 rounded-3xl'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-4 items-center'>
                <img
                  src={jobOffer.companyLogo}
                  alt='Company logo'
                  className='rounded-full size-12 bg-zinc-500 object-contain'
                />
                <p className='text-lg font-normal'>{jobOffer.company}</p>
              </div>
              <p className='text-zinc-500'>{jobOffer.location}</p>
              <p className='text-zinc-500'>{jobOffer.employmentType}</p>
              <div className='flex gap-2 bg-zinc-100 rounded-full p-4 my-4 '>
                <Button
                  className={cn('flex-1 rounded-full hover:bg-yellow-200', { 'bg-yellow-200': jobOffer.status === 'applied' })}
                  variant='ghost'
                  onClick={() => handleUpdate(jobOffer.url, 'applied')}
                >
                  Applied
                </Button>
                <Button
                  className={cn('flex-1 rounded-full hover:bg-green-200', { 'bg-green-200': jobOffer.status === 'interview' })}
                  variant='ghost'
                  onClick={() => handleUpdate(jobOffer.url, 'interview')}
                >
                  Interview
                </Button>
                <Button
                  className={cn('flex-1 rounded-full hover:bg-red-200', { 'bg-red-200': jobOffer.status === 'rejected' })}
                  variant='ghost'
                  onClick={() => handleUpdate(jobOffer.url, 'rejected')}
                >
                  Rejected
                </Button>
              </div>
              <div className='flex w-full p-4 gap-4 bg-zinc-100 rounded-full my-4 '>
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
                <p className='h-[calc(100vh-35rem)] max-lg:h-[calc(100vh - 20rem)] overflow-y-auto rounded-lg py-4'>{jobOffer.description}</p>
              ) : selectedTab === 'coverLetter' ? (
                <div className='flex items-center justify-center h-[calc(100vh-38rem)]'>
                  {jobOffer.coverLetter !== '' ? (
                    <Textarea
                      value={jobOffer.coverLetter}
                      className='flex-1 h-full '
                    ></Textarea>
                  ) : (
                    <Button variant={'outline'}>Generate cover letter</Button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default JobOfferPage;
