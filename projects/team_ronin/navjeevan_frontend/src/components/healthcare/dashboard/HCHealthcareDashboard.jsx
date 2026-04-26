import { useMemo, useState } from 'react';
import { registerHealthcareUser } from '../../../api/healthcareUsers';
import { useAuth } from '../../../hooks/useAuth';
import { initialCitizens, initialPrograms } from './dashboardData';
import HCDashboardSidebar from './HCDashboardSidebar';
import HCDashboardTopbar from './HCDashboardTopbar';
import HCAnalyticsSection from './HCAnalyticsSection';
import HCProgramsSection from './HCProgramsSection';
import HCCitizensSection from './HCCitizensSection';
import HCMapSection from './HCMapSection';

export default function HCHealthcareDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('analytics');
  const [programs, setPrograms] = useState(initialPrograms);
  const [citizens, setCitizens] = useState(initialCitizens);
  const [programForm, setProgramForm] = useState({ name: '', date: '', location: '', targetGroup: '' });
  const [citizenForm, setCitizenForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    specialConditions: '',
    region: '',
  });
  const [isCitizenSubmitting, setIsCitizenSubmitting] = useState(false);
  const [citizenError, setCitizenError] = useState('');
  const [citizenSuccess, setCitizenSuccess] = useState('');

  const displayName = user?.name || user?.full_name || user?.fullName || 'Healthcare Staff';

  const activeLabel = useMemo(
    () => activeSection.charAt(0).toUpperCase() + activeSection.slice(1),
    [activeSection],
  );

  const handleProgramSubmit = (event) => {
    event.preventDefault();
    if (!programForm.name || !programForm.date || !programForm.location || !programForm.targetGroup) {
      return;
    }

    setPrograms((currentPrograms) => [
      {
        ...programForm,
        status: 'Scheduled',
      },
      ...currentPrograms,
    ]);

    setProgramForm({ name: '', date: '', location: '', targetGroup: '' });
    setActiveSection('programs');
  };

  const handleCitizenSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: citizenForm.name.trim(),
      email: citizenForm.email.trim(),
      phone_number: citizenForm.phoneNumber.trim(),
      date_of_birth: citizenForm.dateOfBirth,
      special_conditions: citizenForm.specialConditions.trim(),
      region: citizenForm.region.trim(),
    };

    if (!payload.name || !payload.email || !payload.phone_number || !payload.date_of_birth) {
      return;
    }

    setIsCitizenSubmitting(true);
    setCitizenError('');
    setCitizenSuccess('');

    try {
      const response = await registerHealthcareUser(payload);
      const createdUser = response?.data?.user || {};
      const loginId = response?.data?.login_id || createdUser?.login_id || '';

      setCitizens((currentCitizens) => [
        {
          name: createdUser.name || payload.name,
          loginId: loginId || 'Pending',
          email: createdUser.email || payload.email,
          phoneNumber: createdUser.phone_number || payload.phone_number,
          dateOfBirth: createdUser.date_of_birth || payload.date_of_birth,
          region: createdUser.region || payload.region || 'Not set',
          specialConditions: createdUser.special_conditions || payload.special_conditions || 'None',
          status: createdUser.status || 'inactive',
        },
        ...currentCitizens,
      ]);

      setCitizenSuccess(
        loginId
          ? `Citizen registered successfully. Login ID: ${loginId}`
          : 'Citizen registered successfully. Login ID was sent to the provided email.',
      );
      setCitizenForm({
        name: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        specialConditions: '',
        region: '',
      });
      setActiveSection('citizens');
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error.message ||
        'Citizen registration failed. Please try again.';
      setCitizenError(message);
    } finally {
      setIsCitizenSubmitting(false);
    }
  };

  const handleProgramChange = (field, value) => {
    setProgramForm((current) => ({ ...current, [field]: value }));
  };

  const handleCitizenChange = (field, value) => {
    setCitizenForm((current) => ({ ...current, [field]: value }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'programs':
        return (
          <HCProgramsSection
            programs={programs}
            programForm={programForm}
            onProgramChange={handleProgramChange}
            onProgramSubmit={handleProgramSubmit}
          />
        );
      case 'citizens':
        return (
          <HCCitizensSection
            citizens={citizens}
            citizenForm={citizenForm}
            onCitizenChange={handleCitizenChange}
            onCitizenSubmit={handleCitizenSubmit}
            isSubmitting={isCitizenSubmitting}
            error={citizenError}
            success={citizenSuccess}
          />
        );
      case 'map':
        return <HCMapSection />;
      case 'analytics':
      default:
        return <HCAnalyticsSection />;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row">
        <HCDashboardSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          displayName={displayName}
          onLogout={logout}
        />

        <main className="flex-1">
          <HCDashboardTopbar activeLabel={activeLabel} />
          <div className="p-5 lg:p-8">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}