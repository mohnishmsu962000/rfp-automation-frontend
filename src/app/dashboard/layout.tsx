import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-32 p-8">
        <div className="bg-[#f8f6ff] rounded-[40px] border-2 border-gray-200 shadow-lg min-h-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}