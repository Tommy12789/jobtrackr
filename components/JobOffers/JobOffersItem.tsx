import React from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { JobOffers } from './JobOffers';

interface JobOffersItemProps {
  jobOffer: JobOffers;

  selected: string;

  setSelected: (url: string) => void;

  handleDelete: (url: string) => void;
}

const JobOffersItem: React.FC<JobOffersItemProps> = ({ jobOffer, selected, setSelected, handleDelete }) => {
  return (
    <>
      <li
        key={jobOffer.url}
        className={cn('max-2xl:hidden gap-3 relative justify-start items-center flex   cursor-pointer hover:bg-zinc-100  rounded-lg px-4 ', {
          'bg-zinc-100': selected === jobOffer.url,
        })}
        onClick={() => jobOffer.url && setSelected(jobOffer.url)}
      >
        <div className='flex justify-start items-center gap-2  py-8 w-10/12'>
          <img
            src={jobOffer.companyLogo ? jobOffer.companyLogo : '/logo.svg'}
            alt={jobOffer.company}
            className={cn('rounded-full size-8 bg-zinc-500 object-contain', { 'bg-white': !jobOffer.companyLogo })}
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

      <Link
        href={`/job-offers/${jobOffer.slug}`}
        className='2xl:hidden'
      >
        <li
          key={jobOffer.url}
          className={cn('2xl:hidden gap-3 relative justify-start items-center flex   cursor-pointer hover:bg-zinc-100  rounded-lg px-4 ', {
            'bg-zinc-100': selected === jobOffer.url,
          })}
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
                e.preventDefault();
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
  );
};

export default JobOffersItem;
