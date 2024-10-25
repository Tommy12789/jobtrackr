import React from 'react';

const HomePage = () => {
  return (
    <div className='flex flex-col px-8 py-4 space-y-8 h-full'>
      <header className='border-b-2 pb-4'>
        <h2 className='text-3xl font-bold'>Home</h2>
      </header>
      <div className='flex h-full w-full items-center justify-center'>
        <div className='max-w-4xl mx-auto flex flex-col gap-8 bg-zinc-100 p-8 rounded-xl'>
          <section className='flex flex-col gap-4'>
            <h3 className='text-2xl font-semibold'>Welcome to JobTrackr</h3>
            <p className='text-gray-700 leading-relaxed'>
              JobTrackr is your personal assistant for job searching. Easily track your applications, organize job offers, and generate personalized
              cover letters with AI. Simplify your job search and improve your application process with our powerful tools.
            </p>
          </section>

          <section className='space-y-6 mt-8'>
            <h3 className='text-2xl font-semibold'>Features</h3>

            <div className='space-y-4'>
              <div>
                <h4 className='text-xl font-medium'>Adding Job Offers</h4>
                <p className='text-gray-700 leading-relaxed'>
                  In the <strong>Job Offers</strong> tab, easily add job offers that interest you:
                </p>
                <ul className='list-disc list-inside pl-5 text-gray-700 leading-relaxed'>
                  <li>
                    By pasting the job offer link, currently supported for <strong>Workday</strong> and <strong>LinkedIn</strong> sites.
                  </li>
                  <li>By manually filling in the information (company name, position, location, etc.).</li>
                </ul>
                <p className='text-gray-700 leading-relaxed'>
                  You can also track the status of each job offer by selecting whether you have applied, have an interview scheduled, or have been
                  rejected.
                </p>
              </div>

              <div>
                <h4 className='text-xl font-medium'>Cover Letter Generation</h4>
                <p className='text-gray-700 leading-relaxed'>
                  Generate a cover letter tailored to each offer directly in the <strong>Cover Letter</strong> tab of each job offer. Make sure to
                  fill in your personal information for a personalized cover letter.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
