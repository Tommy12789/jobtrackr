import React, { useRef, useEffect, useCallback, useState, SetStateAction, Dispatch } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { JobOffers } from '@/components/JobOffers/JobOffers';
import { Label } from '@/components/ui/label';

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
    description: '',
    employment_type: '',
    link_manual: '',
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
            description: formData.description,
            employment_type: formData.employment_type,
            link_manual: formData.link_manual,
          };

    if (selectedOption === 'link') {
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
            description: '',
            employment_type: '',
            link_manual: '',
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

          toast({
            title: 'Error while adding job offer, please verify your link and try again',
            duration: 5000,
            variant: 'destructive',
          });
          setIsLoading(false);
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
    } else {
      try {
        const response = await fetch(`/api/jobOffers/add/manual?userId=${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        });

        if (response.ok) {
          console.log(response);
          const dataJson = await response.json();
          const newJobOffer = dataJson.jobOffer;
          newJobOffer.coverLetter = '';
          newJobOffer.status = '';
          setJobOffers((prevJobOffers) => [...prevJobOffers, newJobOffer]);
          setFormData({
            link: '',
            companyName: '',
            position: '',
            location: '',
            description: '',
            employment_type: '',
            link_manual: '',
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
            closeModal();
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Network error:', error);
        toast({
          title: 'Network error, please try again',
          duration: 5000,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
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
              className={cn('flex-1 rounded-full hover:bg-purple-500 hover:text-zinc-50', {
                'bg-purple-500 text-zinc-50': selectedOption === 'link',
              })}
              variant={'ghost'}
              onClick={() => setSelectedOption('link')}
            >
              Link
            </Button>
            <Button
              type='button'
              variant={'ghost'}
              className={cn('flex-1 rounded-full hover:bg-purple-500 hover:text-zinc-50', {
                'bg-purple-500 text-zinc-50': selectedOption === 'manual',
              })}
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
                placeholder='Offer Link (only LinkedIn and Workday for now)'
              />
              <Button
                variant={'outline'}
                type='submit'
                className='rounded-full bg-purple-500 text-zinc-50 hover:bg-purple-700 hover:text-zinc-50'
                key={isLoading ? 'loading' : 'idle'}
              >
                {isLoading ? (
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
                  'Add job offer'
                )}
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
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Description'
              />
              <Input
                name='employment_type'
                value={formData.employment_type}
                onChange={handleInputChange}
                placeholder='Employment Type (hybrid, etc.)'
              />
              <Input
                name='link_manual'
                value={formData.link_manual}
                onChange={handleInputChange}
                placeholder='Link'
              />
              <Button
                variant={'outline'}
                type='submit'
                className='rounded-full bg-purple-500 text-zinc-50 hover:bg-purple-700 hover:text-zinc-50'
                key={isLoading ? 'loading' : 'idle'}
              >
                {isLoading ? (
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
                  'Add job offer'
                )}
              </Button>
            </>
          )}
        </form>
      </dialog>
    </>
  );
};

export default JobOfferModal;
