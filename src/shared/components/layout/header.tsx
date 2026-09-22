import { Link } from 'react-router-dom';
import { useProfile } from '../../../features/profile/hooks/use_profile';
import { fileUrl } from '../../utils/file_url';

export default function Header() {
  // Sebelumnya avatar di sini hardcode ke "/default-avatar.png" yang memang
  // tidak pernah ada filenya, jadi selalu tampil broken image. Sekarang
  // ambil foto profil asli (sama seperti halaman Profile/Edit Profile),
  // dengan fallback inisial kalau user belum punya foto.
  const { profile } = useProfile();

  const initial = (profile?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-text">QualiTrack</span>
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
