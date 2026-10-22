export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}
