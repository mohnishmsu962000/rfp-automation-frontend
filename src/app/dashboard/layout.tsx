import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-17 p-3 ">
        <div className="bg-gradient-to-br from-[#fffbee] via-[#f8f6ff] to-[#fdf4ff] rounded-[20px] border-1 border-gray-300 shadow-md min-h-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}