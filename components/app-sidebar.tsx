'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';

import { useSession, signIn, signOut } from 'next-auth/react';

import { Home, BriefcaseBusiness, UserPen, CircleUserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const items = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Job Offers', url: '/job-offers', icon: BriefcaseBusiness },
  { title: 'Personnals Informations', url: '/personnals-informations', icon: UserPen },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <Sidebar
      variant='inset'
      collapsible='icon'
    >
      <SidebarHeader>
        <div className={cn('flex items-center gap-2 pl-1', {})}>
          <Image
            src='/logo.svg'
            alt='logo'
            className='size-7'
            width={7}
            height={7}
          />
          <h2 className='font-semibold group-data-[collapsible=icon]:hidden  bg-gradient-to-tr from-purple-500 to-pink-500 text-transparent  bg-clip-text'>
            JobTrackR
          </h2>
        </div>
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    size={'lg'}
                    {...(pathname === item.url ? { isActive: true } : {})}
                  >
                    <Link href={item.url}>
                      <item.icon className='w-14 h-14' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />

        <SidebarMenuButton
          onClick={session ? () => signOut() : () => signIn('google')}
          asChild
          size={'lg'}
        >
          <Link href={'/'}>
            {session ? (
              session.user?.image ? (
                <img
                  src={session.user.image}
                  alt='logo'
                  className='size-8 rounded-full'
                />
              ) : (
                <CircleUserRound />
              )
            ) : (
              <CircleUserRound />
            )}
            <span>User</span>{' '}
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
