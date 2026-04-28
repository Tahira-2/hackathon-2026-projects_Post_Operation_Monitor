import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  static final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;

    tz.initializeTimeZones();

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const initializationSettings = InitializationSettings(
      android: androidSettings,
    );

    await flutterLocalNotificationsPlugin.initialize(
        settings: initializationSettings);

    await _createChannels();
    await requestPermissions();

    _initialized = true;
  }

  static Future<void> _createChannels() async {
    final androidPlugin =
        flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin == null) return;

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        'daily_medication_channel',
        'Daily Medication Reminders',
        description: 'Daily reminders for scheduled medications',
        importance: Importance.high,
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        'timing_ready_channel',
        'Meal Timing Notifications',
        description: 'Notifications when meal window opens',
        importance: Importance.high,
      ),
    );
  }

  static Future<void> requestPermissions() async {
    final androidPlugin =
        flutterLocalNotificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    await androidPlugin?.requestNotificationsPermission();
  }

  static Future<void> showTimingReadyNotification({
    required String medicationName,
  }) async {
    await flutterLocalNotificationsPlugin.show(
      id: medicationName.hashCode,
      title: 'Meal window open',
      body: 'You can now eat after taking $medicationName',
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'timing_ready_channel',
          'Meal Timing Notifications',
          channelDescription: 'Notifications when meal window opens',
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
    );
  }

  static Future<void> scheduleDailyMedicationReminder({
    required int id,
    required String medicationName,
    required int hour,
    required int minute,
  }) async {
    final now = DateTime.now();

    DateTime scheduled = DateTime(
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );

    if (!scheduled.isAfter(now)) {
      scheduled = scheduled.add(const Duration(days: 1));
    }

    final delay = scheduled.difference(now);

    if (kDebugMode) {
      print('Now: $now');
      print('Scheduling local reminder for $medicationName at $scheduled');
      print('Delay: $delay');
    }

    await Future.delayed(const Duration(milliseconds: 1));

    await flutterLocalNotificationsPlugin.zonedSchedule(
      id: id,
      title: 'Medication reminder',
      body: 'Time to take $medicationName',
      scheduledDate: tz.TZDateTime.now(tz.local).add(delay),
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'daily_medication_channel',
          'Daily Medication Reminders',
          channelDescription: 'Daily reminders for scheduled medications',
          importance: Importance.high,
          priority: Priority.high,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }
}
