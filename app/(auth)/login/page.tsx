'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      // Fallback: ensure profile exists (in case trigger didn't run at signup)
      await fetch('/api/ensure-profile', { method: 'POST', credentials: 'include' });

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-xl border border-[#27272a] bg-[#111113] p-6 shadow-none transition-all duration-200 ease-out">
      <CardHeader className="space-y-2 p-0 pb-6">
        <CardTitle className="text-2xl font-semibold tracking-tight text-[#fafafa]">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base text-[#a1a1aa]">
          Sign in to your account to continue learning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert
                variant="destructive"
                className="rounded-lg border border-[#ef4444]/50 bg-[#ef4444]/10 text-[#ef4444] [&>svg]:text-[#ef4444]"
              >
                <AlertTitle className="font-medium text-[#ef4444]">
                  Error
                </AlertTitle>
                <AlertDescription className="text-sm text-[#ef4444]/90">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-[#fafafa]">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 rounded-lg border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#ef4444] text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-[#fafafa]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="h-11 rounded-lg border border-[#27272a] bg-[#111113] px-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#52525b] focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[#ef4444] text-sm" />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#4f46e5] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#27272a]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111113] px-2 text-[#52525b]">
              New to Lectur.io?
            </span>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#27272a] bg-transparent px-6 text-sm font-medium no-underline text-[#a1a1aa] transition-all duration-150 hover:bg-[#1a1a1f] hover:text-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
          >
            Create an account
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
