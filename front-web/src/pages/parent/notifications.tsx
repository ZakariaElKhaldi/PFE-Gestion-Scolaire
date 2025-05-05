import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { User } from "../../types/auth";
import { NotificationsPage as SharedNotifications } from "../shared/notifications/index";

interface ParentNotificationsPageProps {
  user: User;
}

export const NotificationsPage = ({ user }: ParentNotificationsPageProps) => {
  return (
    <DashboardLayout user={user}>
      <SharedNotifications user={user} />
    </DashboardLayout>
  );
}; 