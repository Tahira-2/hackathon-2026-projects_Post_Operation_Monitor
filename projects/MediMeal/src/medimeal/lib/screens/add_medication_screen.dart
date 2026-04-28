import 'package:flutter/material.dart';

import '../models/medicine_template.dart';
import '../models/user_medication.dart';

class AddMedicationScreen extends StatefulWidget {
  final List<MedicineTemplate> templates;

  const AddMedicationScreen({
    super.key,
    required this.templates,
  });

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  MedicineTemplate? selectedTemplate;
  TimeOfDay selectedTime = const TimeOfDay(hour: 6, minute: 0);

  String _formatTime(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '$hour:$minute $period';
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: selectedTime,
    );

    if (picked != null) {
      setState(() {
        selectedTime = picked;
      });
    }
  }

  void _saveMedication() {
    if (selectedTemplate == null) return;

    final newMedication = UserMedication(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      template: selectedTemplate!,
      reminderTimeLabel: _formatTime(selectedTime),
      reminderHour: selectedTime.hour,
      reminderMinute: selectedTime.minute,
      isTakenToday: false,
    );

    Navigator.pop(context, newMedication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Medicine'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Choose a supported medicine and set a reminder time.',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Medicine',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<MedicineTemplate>(
              initialValue: selectedTemplate,
              items: widget.templates
                  .map(
                    (template) => DropdownMenuItem(
                      value: template,
                      child: Text('${template.name} • ${template.dosage}'),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                setState(() {
                  selectedTemplate = value;
                });
              },
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Reminder time',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickTime,
              borderRadius: BorderRadius.circular(14),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF334155),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatTime(selectedTime),
                      style: const TextStyle(fontSize: 16),
                    ),
                    const Icon(Icons.access_time),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 28),
            if (selectedTemplate != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        selectedTemplate!.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        selectedTemplate!.userHeadline,
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: selectedTemplate == null ? null : _saveMedication,
                icon: const Icon(Icons.add_circle_outline),
                label: const Text('Add to My Medicines'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
