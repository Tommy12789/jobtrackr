'use client';

import React from 'react';

import JobOffersList from '@/components/job-offers-list';

const Page = () => {
  return (
    <div className='px-8 py-4 flex flex-col gap-4 h-full'>
      <h2 className='text-2xl font-semibold text-zinc-700 border-b-2 pb-4'>Job Offers</h2>
      <JobOffersList />
    </div>
  );
};

export default Page;
