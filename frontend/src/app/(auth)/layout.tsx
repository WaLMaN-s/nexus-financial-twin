import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-6">
        <Link href="/" className="w-fit"><Logo /></Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(55%_45%_at_35%_25%,rgba(255,255,255,0.16),transparent)]"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <blockquote className="max-w-md text-2xl font-medium leading-snug">
            “The twin showed me my house down payment was 14 months late — and
            exactly which three habits were the reason.”
          </blockquote>
          <p className="mt-4 text-sm text-indigo-200">
            Andi Pratama · Product Designer, Jakarta
          </p>
        </div>
      </div>
    </div>
  );
}
