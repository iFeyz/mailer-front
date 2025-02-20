"use client"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <main className=" w-full h-full">
        {children}
      </main>
    </div>
  );
} 