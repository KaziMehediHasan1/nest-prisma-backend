import { NotificationJobPayload } from "src/interfaces/notification";

export interface NotificationEvent extends NotificationJobPayload {
   fcmToken:string
}