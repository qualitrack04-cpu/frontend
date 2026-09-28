import { Link } from 'react-router-dom';
import { useProfile } from '../../../features/profile/hooks/use_profile';
import { fileUrl } from '../../utils/file_url';
import { Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  // Sebelumnya avatar di sini hardcode ke "/default-avatar.png" yang memang
  // tidak pernah ada filenya, jadi selalu tampil broken image. Sekarang
  // ambil foto profil asli (sama seperti halaman Profile/Edit Profile),
  // dengan fallback inisial kalau user belum punya foto.
  const { profile } = useProfile();

  const initial = (profile?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn-mobile-menu" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="logo">
          <span className="logo-text">QualiTrack</span>
        </div>
      </div>

      <Link to="/profile" className="user-avatar" title={profile?.fullName || 'User avatar'}>
        {profile?.profilePhotoUrl ? (
          <img src={fileUrl(profile.profilePhotoUrl)} alt={profile.fullName} />
        ) : (
          <div className="avatar-placeholder-sm">{initial}</div>
        )}
      </Link>
    </header>
  );
}
