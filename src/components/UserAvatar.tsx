import React from 'react';
import { ShieldCheck, Store } from 'lucide-react';
import { UserProfile } from '../types';
import { getPersonaImage } from '../utils/personaImages';

interface UserAvatarProps {
  user: Pick<UserProfile, 'name' | 'role'> & Partial<Pick<UserProfile, 'uid'>> | null | undefined;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = '' }) => {
  const name = user?.name || 'User';
  const identity = `${user?.uid || ''} ${name}`.toLowerCase();
  const isRamesh = identity.includes('ramesh');
  const isLakshmi = identity.includes('lakshmi');
  const isAdmin = user?.role === 'admin';
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const palette = isRamesh
    ? 'bg-[#C85A32] text-white'
    : isLakshmi
      ? 'bg-[#8A4F7D] text-white'
      : isAdmin
        ? 'bg-[#246A83] text-white'
        : 'bg-[#1E4D38] text-white';
  const RoleIcon = isAdmin ? ShieldCheck : Store;
  const image = getPersonaImage(user);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold ${palette} ${className}`}
      role="img"
      aria-label={`${name}${isAdmin ? ', administrator' : ', vendor'}`}
      title={name}
    >
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <span className="sr-only">{initials || 'U'}</span>
      <span className="absolute -bottom-0.5 -right-0.5 z-10 flex h-[40%] min-h-3.5 w-[40%] min-w-3.5 items-center justify-center rounded-full border border-white/80 bg-white text-[#2C241E]">
        <RoleIcon className="h-[70%] w-[70%]" aria-hidden="true" />
      </span>
    </div>
  );
};