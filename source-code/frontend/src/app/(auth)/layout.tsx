export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="container-wrap py-10">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </main>
  );
}
