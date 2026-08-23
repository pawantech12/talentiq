import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar />

        <main className="min-w-0 flex-1 md:ml-[225px]">{children}</main>
      </div>
    </div>
  );
}
