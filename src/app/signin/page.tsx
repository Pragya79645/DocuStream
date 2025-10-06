'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Train, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function LoginPage() {
  const { authUser, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (!loading && authUser) {
      router.push('/dashboard');
    }
  }, [authUser, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUpWithEmail('', email, password);
    } catch (err: any) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-primary p-4 text-primary-foreground w-20 h-20">
              <Train className="h-10 w-10" />
            </div>
            <CardTitle className="font-headline text-3xl">Kochi Metro DocuSnap</CardTitle>
            <CardDescription className="pt-2">
              Automated Document Intelligence for KMRL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {isSignUp ? (
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting || loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting || loading}
                  />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <Button size="lg" type="submit" disabled={submitting || loading}>
                  <LogIn className="mr-2 h-5 w-5" />
                  {submitting || loading ? 'Signing up...' : 'Sign up'}
                </Button>
                <div className="text-center text-sm pt-2">
                  Already have an account?{' '}
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setIsSignUp(false)} disabled={submitting || loading}>
                    Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting || loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting || loading}
                  />
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <Button size="lg" type="submit" disabled={submitting || loading}>
                  <LogIn className="mr-2 h-5 w-5" />
                  {submitting || loading ? 'Authenticating...' : 'Sign in'}
                </Button>
                <div className="text-center text-sm pt-2">
                  Don't have an account?{' '}
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setIsSignUp(true)} disabled={submitting || loading}>
                    Sign up
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kochi Metro Rail Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
}
