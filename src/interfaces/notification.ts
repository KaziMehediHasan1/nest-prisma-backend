export interface NotificationJobPayload {
  profileId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
