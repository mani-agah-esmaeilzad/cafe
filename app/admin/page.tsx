import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLoginCard from "@/components/admin/AdminLoginCard";
import { getAdminFromCookies } from "@/lib/auth";

const AdminPage = async () => {
  const admin = await getAdminFromCookies();

  if (!admin) {
    return <AdminLoginCard />;
  }

  return <AdminDashboard adminEmail={admin.email} />;
};

export default AdminPage;
