import { Link } from 'react-router-dom';
import { useProfile } from '../../../features/profile/hooks/use_profile';
import { fileUrl } from '../../utils/file_url';
import { Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { profile } = useProfile();
  const initial = (profile?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-[100] flex justify-between items-center px-[28px] py-[12px] bg-white border-b border-[#e5e7eb] shrink-0">
      <div className="flex items-center gap-[12px]">
        <button className="md:hidden flex bg-transparent border-none cursor-pointer text-[#0f2c52] p-[4px]" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-[8px] font-bold text-[20px] text-[#0f2c52]">
          <span>QualiTrack</span>
        </div>
      </div>

      <Link to="/profile" className="no-underline" title={profile?.fullName || 'User avatar'}>
        {profile?.profilePhotoUrl ? (
          <img src={fileUrl(profile.profilePhotoUrl)} alt={profile.fullName} className="w-[40px] h-[40px] rounded-full object-cover" />
        ) : (
          <div className="w-[40px] h-[40px] rounded-full bg-[#cbd5e1] text-[#475569] flex items-center justify-center font-bold text-[16px]">{initial}</div>
        )}
      </Link>
    </header>
  );
}
