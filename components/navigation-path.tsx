'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

const NavigationPath = () => {
  const pathName = usePathname()
    .split('/')
    .filter((path) => path !== '')
    .map((path) =>
      path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );

  // Générer le chemin cumulatif pour chaque élément
  const generatePath = (index: number) => {
    const fullPath = pathName
      .slice(0, index + 1)
      .join('/')
      .replace(/\s+/g, '-')
      .toLowerCase();
    return `/${fullPath}`;
  };

  return (
    <div className='flex items-center w-12'>
      <Link href={'/'}>
        <Button
          className='font-normal'
          variant={'ghost'}
        >
          Home
        </Button>
      </Link>

      {pathName.length > 0 &&
        pathName.map((path, index) => (
          <span
            className='font-light flex items-center'
            key={index}
          >
            <span className='mx-2'>/</span>
            <Link href={generatePath(index)}>
              <Button
                className='font-normal'
                variant={'ghost'}
              >
                {path}
              </Button>
            </Link>
          </span>
        ))}
    </div>
  );
};

export default NavigationPath;
