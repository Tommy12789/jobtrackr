/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';

const page = () => {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    zip: '',
    city: '',
    country: '',
  });
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user?userId=${userId}`, {
          method: 'GET',
        });

        const data = await response.json();
        console.log(data);
        if (data && data.length > 0) {
          setFormData({
            firstName: data[0].first_name || '',
            lastName: data[0].last_name || '',
            phoneNumber: data[0].phone || '',
            address: data[0].address || '',
            zip: data[0].zip || '',
            city: data[0].city || '',
            country: data[0].country || '',
          });
          setResumeText(data[0].resume || '');
        } else {
          toast.toast({
            title: 'No user data found',
            duration: 5000,
            variant: 'destructive',
          });
        }

        if (!response.ok) {
          toast.toast({
            title: 'An error occured',
            duration: 5000,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Network error:', error);
        toast.toast({
          title: 'Network error, while fetching personnal informations, please try again',
          duration: 5000,
          variant: 'destructive',
        });
      }
    };

    fetchUser();
  }, [userId]);

  const handleFileChange = async (file: File) => {
    if (!file || !userId) return;

    try {
      const formDatas = new FormData();
      formDatas.append('resume', file);
      formDatas.append('userId', userId);

      const response = await fetch(`/api/user/update/resume`, {
        method: 'PUT',
        body: formDatas,
      });

      if (!response.ok) {
        throw new Error('Error uploading file');
      }

      const data = await response.json();
      const pdfText = data?.resumeText;
      console.log('PDF text:', pdfText);
      setResumeText(pdfText || 'No text extracted from the resume.');
      toast.toast({
        title: 'Resume text updated successfully',
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      setResumeText('Failed to upload or extract text from the file.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    console.log(formData);
  };

  const handleUpdateResumeText = async () => {
    if (!userId) return;

    const formDatas = new FormData();
    formDatas.append('resume', resumeText);
    formDatas.append('userId', userId);

    try {
      const response = await fetch(`/api/user/update/resume?userId=${userId}`, {
        method: 'POST',
        body: formDatas,
      });

      if (!response.ok) {
        throw new Error('Error updating resume text');
      }

      toast.toast({
        title: 'Resume text updated successfully',
        duration: 5000,
      });
    } catch (error) {
      console.error(error);
      toast.toast({
        title: 'Failed to update resume text',
        duration: 5000,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const dataToSubmit = {
      userId: userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      zip: formData.zip,
      city: formData.city,
      country: formData.country,
    };

    try {
      const response = await fetch(
        `/api/user/update?firstName=${dataToSubmit.firstName}&lastName=${dataToSubmit.lastName}&phoneNumber=${dataToSubmit.phoneNumber}&address=${dataToSubmit.address}&zip=${dataToSubmit.zip}&city=${dataToSubmit.city}&country=${dataToSubmit.country}&userId=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (response.ok) {
        console.log(response);
        toast.toast({
          title: 'Personnal informations updated successfully',
          duration: 5000,
        });
      } else {
        toast.toast({
          title: 'An error occured',
          duration: 5000,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.toast({
        title: 'Network error, please try again',
        duration: 5000,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='flex-1 px-8 py-4 '>
      <h2 className='text-2xl font-semibold border-b-2 pb-4'>Personnal Informations</h2>
      <div className=' w-full flex pb-16 pt-6 items-center justify-center'>
        <div className='w-full  bg-zinc-100 rounded-xl flex p-6 gap-6 max-xl:flex-col'>
          <div className='p-6 bg-white flex-1 h-full rounded-xl'>
            <h3 className='pb-4 border-b-2 text-xl font-semibold'>Resume</h3>
            <div className='flex flex-col gap-4  justify-center pt-8 '>
              <Label
                htmlFor='file'
                className='py-6 px-10 w-full flex flex-col items-center justify-center gap-3 border-dashed border-2 rounded-xl cursor-pointer'
              >
                <span>Upload your Resume here or paste text below</span>
                <input
                  type='file'
                  id='file'
                  className='hidden'
                  accept='.pdf'
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </Label>
              <Label
                htmlFor='text'
                className='text-lg'
              >
                Here is what we have for your resume:
              </Label>
              <Textarea
                onChange={(e) => setResumeText(e.target.value)}
                placeholder='Resume text'
                className='p-4 h-96 bg-slate-100 rounded-lg border border-slate-200 max-xl:h-40'
                value={resumeText}
              />
              <Button
                className='w-full mt-10 max-xl:mt-2 hover:bg-purple-500 hover:text-white'
                variant={'outline'}
                onClick={handleUpdateResumeText}
              >
                Update resume text
              </Button>
            </div>
          </div>
          <div className='p-6 bg-white flex-1 rounded-xl'>
            <h3 className='pb-4 border-b-2 text-xl font-semibold'>Personnal informations</h3>
            <div className='w-full  flex flex-col'>
              <form
                action=''
                className='flex pt-6 flex-col gap-4 items-start justify-center'
              >
                <div className='flex  gap-4 w-full '>
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label className='text-lg'>Firstname</Label>
                    <Input
                      type='text'
                      name='firstName'
                      onChange={handleInputChange}
                      value={formData.firstName}
                    />
                  </div>
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label className='text-lg'>Lastname</Label>
                    <Input
                      type='text'
                      name='lastName'
                      onChange={handleInputChange}
                      value={formData.lastName}
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-2 w-full'>
                  <Label className='text-lg'>Address</Label>
                  <Input
                    type='text'
                    name='address'
                    onChange={handleInputChange}
                    value={formData.address}
                  />
                </div>
                <div className='flex  gap-4 w-full '>
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label className='text-lg'>City</Label>
                    <Input
                      type='text'
                      name='city'
                      onChange={handleInputChange}
                      value={formData.city}
                    />
                  </div>
                  <div className='flex flex-col gap-2 flex-1'>
                    <Label className='text-lg'>Zip</Label>
                    <Input
                      type='text'
                      name='zip'
                      onChange={handleInputChange}
                      value={formData.zip}
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-2 w-full'>
                  <Label className='text-lg'>Country</Label>
                  <Input
                    type='text'
                    name='country'
                    onChange={handleInputChange}
                    value={formData.country}
                  />
                </div>
                <div className='flex flex-col gap-2 w-full'>
                  <Label className='text-lg'>Phone Number</Label>
                  <Input
                    type='text'
                    name='phoneNumber'
                    onChange={handleInputChange}
                    value={formData.phoneNumber}
                  />
                </div>
                <Button
                  type='submit'
                  variant={'outline'}
                  onClick={handleSubmit}
                  className='w-full mt-10 hover:bg-purple-500 hover:text-white'
                >
                  Save informations
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
