import 'medicine_template.dart';

class UserMedication {
  final String id;
  final MedicineTemplate template;
  final String reminderTimeLabel;
  final int reminderHour;
  final int reminderMinute;
  final bool isTakenToday;

  const UserMedication({
    required this.id,
    required this.template,
    required this.reminderTimeLabel,
    required this.reminderHour,
    required this.reminderMinute,
    required this.isTakenToday,
  });

  UserMedication copyWith({
    String? id,
    MedicineTemplate? template,
    String? reminderTimeLabel,
    int? reminderHour,
    int? reminderMinute,
    bool? isTakenToday,
  }) {
    return UserMedication(
      id: id ?? this.id,
      template: template ?? this.template,
      reminderTimeLabel: reminderTimeLabel ?? this.reminderTimeLabel,
      reminderHour: reminderHour ?? this.reminderHour,
      reminderMinute: reminderMinute ?? this.reminderMinute,
      isTakenToday: isTakenToday ?? this.isTakenToday,
    );
  }
}
