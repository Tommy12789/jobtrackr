'use client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

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
      )}
    </div>
  );
};

export default JobOfferPage;
