import DashboardNav from "@/components/dashboard/dashboardNav";
import ClubProvider from "@/providers/clubprovider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClubProvider>
      <div className="flex flex-col md:flex-row h-[100dvh] bg-gray-50 overflow-hidden">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </ClubProvider>
  );
}
