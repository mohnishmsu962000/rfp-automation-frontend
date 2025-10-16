export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen">
        <div className="flex">
          <div>Sidebar will go here</div>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    );
  }