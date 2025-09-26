import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { authApi } from '../lib/api';

export function Navbar() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });

  return (
    <nav className="w-full bg-white border-b shadow-sm mb-4">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-foreground">QnA Hub</Link>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span className="text-muted-foreground">Hello, {user?.data?.username}</span>
              <Button variant="outline" onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="outline" onClick={async () => {
                await authApi.logout();
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                navigate('/');
              }}>Logout</Button>
            </>
          ) : (
            <Button variant="outline" id="open-auth-dialog">Login</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
