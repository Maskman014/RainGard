import rameshImage from '../assets/images/avatar_worker_ramesh_1790696682270.jpg';
import priyaImage from '../assets/images/avatar_admin_priya_1790696697315.jpg';
import lakshmiImage from '../assets/images/rainguard_hero_vendor_1790696666460.jpg';
import { UserProfile } from '../types';

export function getPersonaImage(user: Pick<UserProfile, 'uid' | 'name' | 'role'> | null | undefined): string {
  const identity = `${user?.uid || ''} ${user?.name || ''}`.toLowerCase();
  if (identity.includes('ramesh')) return rameshImage;
  if (identity.includes('lakshmi')) return lakshmiImage;
  if (identity.includes('priya') || user?.role === 'admin') return priyaImage;
  return user?.role === 'admin' ? priyaImage : lakshmiImage;
}
