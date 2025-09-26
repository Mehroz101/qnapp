import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
async function loginApi(username: string, password: string) {
  const res = await fetch( baseURL+'/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

async function signupApi(username: string, password: string) {
  const res = await fetch(baseURL+'/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: () => loginApi(username, password),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onOpenChange(false);
      if(data.accessToken){
        localStorage.setItem('accessToken', data.accessToken);
      }
      setError('');
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setError(err.message);
        
      } else {
        setError('Login failed');
      }
    }
  });

  const signupMutation = useMutation({
    mutationFn: () => signupApi(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onOpenChange(false);
      setError('');
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      loginMutation.mutate();
    } else {
      signupMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-sm mx-auto">
        <DialogHeader className="w-full text-center">
          <DialogTitle>{mode === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={loginMutation.isPending || signupMutation.isPending}>
            {mode === 'login'
              ? loginMutation.isPending ? 'Logging in...' : 'Login'
              : signupMutation.isPending ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-2 text-center text-sm w-full">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => { setMode('signup'); setError(''); }}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => { setMode('login'); setError(''); }}>
                Login
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
