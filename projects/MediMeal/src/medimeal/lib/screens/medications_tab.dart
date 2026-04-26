import 'package:flutter/material.dart';

import '../models/user_medication.dart';
import '../widgets/section_title.dart';

class MedicationsTab extends StatelessWidget {
  final List<UserMedication> medications;
  final void Function(UserMedication) onMedicationTaken;
  final VoidCallback onAddMedication;

  const MedicationsTab({
    super.key,
    required this.medications,
    required this.onMedicationTaken,
    required this.onAddMedication,
  });

  Widget _buildMedicationCard(UserMedication medication, VoidCallback onTaken) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              medication.template.name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _infoChip('Dose', medication.template.dosage),
                _infoChip('Reminder', medication.reminderTimeLabel),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              medication.template.userHeadline,
              style: const TextStyle(
                color: Color(0xFFCBD5E1),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onTaken,
              child: const Text('Mark as Taken'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF334155),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 13,
          color: Colors.white,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Medications',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Add your medication and log when you take it',
            style: TextStyle(
              color: Color(0xFF94A3B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: onAddMedication,
            icon: const Icon(Icons.add),
            label: const Text('Add Medicine'),
          ),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Your Medicines'),
          if (medications.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Text(
                  'No medicines added yet. Tap “Add Medicine” to get started.',
                  style: TextStyle(
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
              ),
            )
          else
            ...medications.map(
              (medication) => _buildMedicationCard(
                medication,
                () => onMedicationTaken(medication),
              ),
            ),
        ],
      ),
    );
  }
}
