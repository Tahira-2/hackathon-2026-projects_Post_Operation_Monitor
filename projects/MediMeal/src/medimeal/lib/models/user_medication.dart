import 'medicine_template.dart';

class UserMedication {
  final String id;
  final MedicineTemplate template;
  final String reminderTimeLabel;
  final int reminderHour;
  final int reminderMinute;

  const UserMedication({
    required this.id,
    required this.template,
    required this.reminderTimeLabel,
    required this.reminderHour,
    required this.reminderMinute,
  });
}
