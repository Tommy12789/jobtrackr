import React from 'react';
import { JobOffers } from './JobOffers';
import JobOffersItem from './JobOffersItem';

interface JobOffersListProps {
  jobOffers: JobOffers[];
  selected: string;
  setSelected: (url: string) => void;
  handleDelete: (url: string) => void;
}

const JobOffersList: React.FC<JobOffersListProps> = ({ jobOffers, selected, setSelected, handleDelete }) => {
  return (
    <ul className='[&_li]:mb-2 mt-4 overflow-y-auto h-[calc(100vh-18rem)] rounded-md'>
      {jobOffers.map((jobOffer: JobOffers) => (
        <JobOffersItem
          key={jobOffer.url}
          jobOffer={jobOffer}
          selected={selected}
          setSelected={setSelected}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  );
};

export default JobOffersList;
