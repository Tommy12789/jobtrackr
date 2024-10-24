import React, { useRef, useEffect, useCallback, useState, SetStateAction, Dispatch } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { JobOffers } from './job-offers-list';
import { Label } from './ui/label';

interface JobOfferModalProps {
  isOpen: boolean;
  closeModal: () => void;
  setJobOffers: Dispatch<SetStateAction<JobOffers[]>>;
}

const JobOfferModal: React.FC<JobOfferModalProps> = ({ isOpen, closeModal, setJobOffers }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedOption, setSelectedOption] = useState('link');
  const [formData, setFormData] = useState({
    link: '',
    companyName: '',
    position: '',
    location: '',
    date: '',
    description: '',
  });
  const { data: session } = useSession();
  const userId = session?.user.id;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      document.addEventListener('keydown', handleKeyDown);
    } else {
      dialogRef.current?.close();
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const dataToSubmit =
      selectedOption === 'link'
        ? { link: formData.link }
        : {
            companyName: formData.companyName,
            position: formData.position,
            location: formData.location,
            date: formData.date,
            description: formData.description,
          };

    try {
      const response = await fetch(`/api/jobOffers/add?url=${formData.link}&userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        console.log(response);
        const newJobOffer = await response.json();
        newJobOffer.coverLetter = '';
        newJobOffer.status = '';
        setJobOffers((prevJobOffers) => [...prevJobOffers, newJobOffer]);
        setFormData({
          link: '',
          companyName: '',
          position: '',
          location: '',
          date: '',
          description: '',
        });
        toast({
          title: 'Job offer added successfully',
          duration: 5000,
        });
        closeModal();
        setIsLoading(false);
      } else {
        console.log(response);
        if (response.statusText === 'User already linked to this job offer') {
          console.error('Error adding job offer');
          toast({
            title: 'Job offer already added',
            duration: 5000,
            variant: 'destructive',
          });
          setIsLoading(false);
          closeModal();
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({
        title: 'Network error, please try again',
        duration: 5000,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <>
      {isOpen && <div className='fixed inset-0 bg-black bg-opacity-75 z-40 pointer-events-none'></div>}
      <dialog
        ref={dialogRef}
        className='fixed top-0 left-0 z-50 w-96 p-4 bg-white rounded-xl'
      >
        <div className='flex justify-end top-2 right-2'>
          <Button
            onClick={closeModal}
            variant={'ghost'}
            size={'icon'}
          >
            <X />
          </Button>
        </div>
        <form
          className='flex flex-col gap-4 items-center'
          onSubmit={handleSubmit}
        >
          <h2 className='text-xl border-b w-full pb-2 text-center font-thin'>Add job offer</h2>
          <div className='bg-zinc-200 w-full rounded-full p-2 flex gap-2'>
            <Button
              type='button'
              className={cn('flex-1 rounded-full', { 'bg-zinc-50': selectedOption === 'link' })}
              variant={'ghost'}
              onClick={() => setSelectedOption('link')}
            >
              Link
            </Button>
            <Button
              type='button'
              variant={'ghost'}
              className={cn('flex-1 rounded-full', { 'bg-zinc-50': selectedOption === 'manual' })}
              onClick={() => setSelectedOption('manual')}
            >
              Manual
            </Button>
          </div>
          {selectedOption === 'link' ? (
            <>
              <Label></Label>
              <Input
                name='link'
                value={formData.link}
                onChange={handleInputChange}
                placeholder='Offer Link'
              />
              <Button
                className='mr-0'
                variant={'outline'}
                type='submit'
              >
                Add job offer
              </Button>
            </>
          ) : (
            <>
              <Input
                name='companyName'
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder='Company Name'
              />
              <Input
                name='position'
                value={formData.position}
                onChange={handleInputChange}
                placeholder='Position'
              />
              <Input
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                placeholder='Location'
              />
              <Input
                name='date'
                value={formData.date}
                onChange={handleInputChange}
                placeholder='Date'
              />
              <Input
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Description'
              />
              <Button
                variant={'outline'}
                type='submit'
                key={isLoading ? 'loading' : 'idle'}
              >
                {isLoading ? 'Adding job offer...' : 'Add job offer'}
              </Button>
            </>
          )}
        </form>
      </dialog>
    </>
  );
};

export default JobOfferModal;
