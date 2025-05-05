import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { User } from "../../types/auth";
import { NotificationsPage as SharedNotifications } from "../shared/notifications/index";

interface StudentNotificationsPageProps {
  user: User;
}

export const NotificationsPage = ({ user }: StudentNotificationsPageProps) => {
  return (
    <DashboardLayout user={user}>
      <SharedNotifications user={user} />
    </DashboardLayout>
  );
}; 