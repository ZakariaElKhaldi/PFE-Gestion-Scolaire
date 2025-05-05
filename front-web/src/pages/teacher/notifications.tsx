import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout";
import { User } from "../../types/auth";
import { NotificationsPage as SharedNotifications } from "../shared/notifications/index";

interface TeacherNotificationsPageProps {
  user: User;
}

export const NotificationsPage = ({ user }: TeacherNotificationsPageProps) => {
  return (
    <DashboardLayout user={user}>
      <SharedNotifications user={user} />
    </DashboardLayout>
  );
}; 