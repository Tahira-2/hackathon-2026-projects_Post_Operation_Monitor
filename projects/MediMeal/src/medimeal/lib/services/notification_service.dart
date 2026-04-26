import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const settings = InitializationSettings(
      android: androidSettings,
    );

    await _notifications.initialize(settings: settings);
  }

  static Future<void> showTimingReadyNotification({
    required String medicationName,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'timing_workflow_channel',
      'Timing Workflow Notifications',
      channelDescription: 'Notifications for timing-based meal reminders',
      importance: Importance.max,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    await _notifications.show(
      id: 0,
      title: 'Meal window is open',
      body:
          'Your waiting period after $medicationName is over. You can now have your meal.',
      notificationDetails: details,
    );
  }
}
