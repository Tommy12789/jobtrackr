import React from 'react';
import JobOfferPage from '@/components/job-offer-page';

const page = () => {
  return (
    <div>
      <div className='px-8 py-4 flex flex-col gap-4 h-full'>
        <JobOfferPage />
      </div>
    </div>
  );
};

export default page;
