import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#09090b] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block no-underline text-[#fafafa] transition-opacity duration-200 hover:opacity-90"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-[#fafafa]">
              Lectur.io
            </h1>
            <p className="mt-2 text-sm text-[#52525b]">
              AI-powered learning platform
            </p>
          </Link>
        </div>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
