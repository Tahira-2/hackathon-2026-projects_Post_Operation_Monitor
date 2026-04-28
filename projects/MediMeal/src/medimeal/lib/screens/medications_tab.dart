import 'package:flutter/material.dart';

import '../models/user_medication.dart';
import '../widgets/section_title.dart';

class MedicationsTab extends StatefulWidget {
  final List<UserMedication> medications;
  final void Function(UserMedication) onMedicationTaken;
  final VoidCallback onAddMedication;

  const MedicationsTab({
    super.key,
    required this.medications,
    required this.onMedicationTaken,
    required this.onAddMedication,
  });

  @override
  State<MedicationsTab> createState() => _MedicationsTabState();
}

class _MedicationsTabState extends State<MedicationsTab> {
  late final PageController _pageController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.92);
  }

  @override
  void didUpdateWidget(covariant MedicationsTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_currentIndex >= widget.medications.length &&
        widget.medications.isNotEmpty) {
      setState(() {
        _currentIndex = widget.medications.length - 1;
      });
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Widget _infoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF172033),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF243041)),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 13,
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildAddMedicineCard(VoidCallback onTap) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF132238),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.add_circle_outline,
                  color: Color(0xFF60A5FA),
                ),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Add a medicine',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Choose a supported medicine and set a daily reminder time.',
                      style: TextStyle(
                        color: Color(0xFFB6C2D1),
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: Color(0xFF8FA1B8),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMedicationCard(UserMedication medication) {
    final taken = medication.isTakenToday;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  height: 48,
                  width: 48,
                  decoration: BoxDecoration(
                    color: taken
                        ? const Color(0xFF123227)
                        : const Color(0xFF132238),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    taken
                        ? Icons.check_circle_outline
                        : Icons.medication_outlined,
                    color: taken
                        ? const Color(0xFF34D399)
                        : const Color(0xFF60A5FA),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        medication.template.name,
                        style: const TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        medication.template.userHeadline,
                        style: const TextStyle(
                          color: Color(0xFFB6C2D1),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _infoChip('Dose', medication.template.dosage),
                _infoChip('Reminder', medication.reminderTimeLabel),
              ],
            ),
            const Spacer(),
            if (taken)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF123227),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF34D399).withOpacity(0.28),
                  ),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 18,
                      color: Color(0xFF34D399),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Taken today',
                      style: TextStyle(
                        color: Color(0xFF34D399),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => widget.onMedicationTaken(medication),
                  icon: const Icon(Icons.check),
                  label: const Text('Mark as Taken'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDots(int count, int current) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        count,
        (index) => AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          height: 8,
          width: index == current ? 22 : 8,
          decoration: BoxDecoration(
            color: index == current
                ? const Color(0xFF60A5FA)
                : const Color(0xFF314055),
            borderRadius: BorderRadius.circular(99),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final meds = widget.medications;

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
            'Manage your medicines and log when you take them',
            style: TextStyle(
              color: Color(0xFF8FA1B8),
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 24),
          _buildAddMedicineCard(widget.onAddMedication),
          const SizedBox(height: 24),
          const SectionTitle(title: 'Your Medicines'),
          const SizedBox(height: 12),
          if (meds.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(18),
                child: Text(
                  'No medicines added yet. Tap “Add a medicine” to get started.',
                  style: TextStyle(
                    color: Color(0xFFB6C2D1),
                    height: 1.4,
                  ),
                ),
              ),
            )
          else ...[
            SizedBox(
              height: 250,
              child: PageView.builder(
                controller: _pageController,
                itemCount: meds.length,
                onPageChanged: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                itemBuilder: (context, index) {
                  final isLast = index == meds.length - 1;
                  return Padding(
                    padding: EdgeInsets.only(right: isLast ? 0 : 12),
                    child: _buildMedicationCard(meds[index]),
                  );
                },
              ),
            ),
            const SizedBox(height: 14),
            _buildDots(meds.length, _currentIndex),
          ],
        ],
      ),
    );
  }
}
