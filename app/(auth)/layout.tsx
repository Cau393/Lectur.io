import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lectur.io
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered learning platform
            </p>
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 blur-3xl" />
          {children}
        </div>
      </div>
    </div>
  );
}
