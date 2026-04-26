import { useEffect, useMemo, useState } from 'react';
import { fetchHealthcareUsers, registerHealthcareUser } from '../../../api/healthcareUsers';
import { getDistricts } from '../../../api/districts';
import { createProgram, createProgramVaccine, fetchPrograms, fetchProgramVaccines } from '../../../api/programs';
import { useAuth } from '../../../hooks/useAuth';
import HCDashboardSidebar from './HCDashboardSidebar';
import HCDashboardTopbar from './HCDashboardTopbar';
import HCAnalyticsSection from './HCAnalyticsSection';
import HCProgramsSection from './HCProgramsSection';
import HCCitizensSection from './HCCitizensSection';
import HCMapSection from './HCMapSection';
import { NEPAL_DISTRICTS } from '../../../constants';

export default function HCHealthcareDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('analytics');
  const [programs, setPrograms] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [programForm, setProgramForm] = useState({
    name: '',
    date: '',
    location: '',
    targetGroup: '',
    notes: '',
    eventStatus: 'NOT_STARTED',
    vaccineIds: [],
  });
  const [citizenForm, setCitizenForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    specialConditions: '',
    region: '',
  });
  const [isCitizenSubmitting, setIsCitizenSubmitting] = useState(false);
  const [isCitizensLoading, setIsCitizensLoading] = useState(false);
  const [citizenError, setCitizenError] = useState('');
  const [citizenSuccess, setCitizenSuccess] = useState('');
  const [districtOptions, setDistrictOptions] = useState([]);
  const [programVaccineOptions, setProgramVaccineOptions] = useState([]);
  const [localVaccineOptions, setLocalVaccineOptions] = useState([]);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);
  const [isProgramSubmitting, setIsProgramSubmitting] = useState(false);
  const [isVaccineSubmitting, setIsVaccineSubmitting] = useState(false);
  const [selectedPredefinedVaccine, setSelectedPredefinedVaccine] = useState('BCG');
  const [customVaccineName, setCustomVaccineName] = useState('');
  const [vaccineLoadError, setVaccineLoadError] = useState('');
  const [programError, setProgramError] = useState('');
  const [programSuccess, setProgramSuccess] = useState('');

  const displayName = user?.name || user?.full_name || user?.fullName || 'Healthcare Staff';

  const activeLabel = useMemo(
    () => activeSection.charAt(0).toUpperCase() + activeSection.slice(1),
    [activeSection],
  );

  const EVENT_STATUS_OPTIONS = ['NOT_STARTED', 'IN_PROGRESS', 'ENDED'];

  const extractProgramMeta = (description, label) => {
    if (!description) {
      return '';
    }
    const line = description
      .split('\n')
      .map((item) => item.trim())
      .find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return line ? line.substring(line.indexOf(':') + 1).trim() : '';
  };

  const mapCitizenFromApi = (apiUser) => ({
    name: apiUser?.name || 'Unknown',
    loginId: apiUser?.login_id || 'Pending',
    email: apiUser?.email || 'N/A',
    phoneNumber: apiUser?.phone_number || 'N/A',
    dateOfBirth: apiUser?.date_of_birth || 'N/A',
    region: apiUser?.region || 'Not set',
    specialConditions: apiUser?.special_conditions || 'None',
    status: apiUser?.status || 'inactive',
  });

  const mapProgramFromApi = (eventItem) => ({
    name: eventItem?.name || 'Untitled program',
    location: eventItem?.event_location_name || 'Unknown district',
    date:
      extractProgramMeta(eventItem?.description || '', 'Date') ||
      (eventItem?.created_at ? new Date(eventItem.created_at).toLocaleDateString() : 'Not specified'),
    targetGroup: extractProgramMeta(eventItem?.description || '', 'Target Group') || 'General',
    notes: extractProgramMeta(eventItem?.description || '', 'Notes') || 'None',
    vaccines: (eventItem?.vaccinations || []).map((vaccine) => vaccine?.vaccination_name).filter(Boolean),
    status: eventItem?.event_status || 'NOT_STARTED',
  });

  const defaultVaccines = [
    { vaccination_name: 'BCG', vaccination_dosage: 1, status: 'AVAILABLE' },
    { vaccination_name: 'OPV', vaccination_dosage: 4, status: 'AVAILABLE' },
    { vaccination_name: 'DPT-HepB-Hib', vaccination_dosage: 3, status: 'AVAILABLE' },
    { vaccination_name: 'MR', vaccination_dosage: 2, status: 'AVAILABLE' },
    { vaccination_name: 'JE', vaccination_dosage: 1, status: 'AVAILABLE' },
  ];

  const mergedVaccineOptions = useMemo(() => {
    const seen = new Set();
    const merged = [];

    [...programVaccineOptions, ...localVaccineOptions].forEach((item) => {
      const key = (item?.vaccination_name || '').trim().toLowerCase();
      if (!key || seen.has(key)) {
        return;
      }
      seen.add(key);
      merged.push(item);
    });

    return merged;
  }, [programVaccineOptions, localVaccineOptions]);

  const addVaccineToSelection = (name, dosage = 1) => {
    const normalizedName = (name || '').trim();
    if (!normalizedName) {
      return;
    }

    const existingBackend = programVaccineOptions.find(
      (item) => item?.vaccination_name?.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (existingBackend?.id) {
      setProgramForm((current) => ({
        ...current,
        vaccineIds: Array.from(new Set([...current.vaccineIds, String(existingBackend.id)])),
      }));
      return;
    }

    const existingLocal = localVaccineOptions.find(
      (item) => item?.vaccination_name?.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (existingLocal?.id) {
      setProgramForm((current) => ({
        ...current,
        vaccineIds: Array.from(new Set([...current.vaccineIds, String(existingLocal.id)])),
      }));
      return;
    }

    const localId = `local-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const localOption = {
      id: localId,
      vaccination_name: normalizedName,
      vaccination_dosage: dosage,
      status: 'AVAILABLE',
      isLocal: true,
    };

    setLocalVaccineOptions((current) => [...current, localOption]);
    setProgramForm((current) => ({
      ...current,
      vaccineIds: Array.from(new Set([...current.vaccineIds, String(localId)])),
    }));
  };

  const loadPrograms = async () => {
    setIsProgramsLoading(true);
    setVaccineLoadError('');
    try {
      const [eventsResponse, districtsResponse, vaccinesResponse] = await Promise.allSettled([
        fetchPrograms(),
        getDistricts(),
        fetchProgramVaccines(),
      ]);

      const eventPayload = eventsResponse.status === 'fulfilled' ? eventsResponse.value?.data : null;
      const districtPayload = districtsResponse.status === 'fulfilled' ? districtsResponse.value?.data : null;
      const vaccinePayload = vaccinesResponse.status === 'fulfilled' ? vaccinesResponse.value?.data : null;
      if (vaccinesResponse.status === 'rejected') {
        const vaccineErrorMessage =
          vaccinesResponse.reason?.response?.data?.error ||
          vaccinesResponse.reason?.response?.data?.detail ||
          vaccinesResponse.reason?.message ||
          'Could not load vaccines.';
        setVaccineLoadError(vaccineErrorMessage);
      }

      const eventResults = eventPayload?.results || eventPayload?.data?.results || eventPayload?.data || eventPayload || [];
      const districtResults = districtPayload?.results || districtPayload?.data?.results || districtPayload?.data || districtPayload || [];
      const vaccineResults = vaccinePayload?.results || vaccinePayload?.data?.results || vaccinePayload?.data || vaccinePayload || [];

      const upcomingPrograms = (Array.isArray(eventResults) ? eventResults : [])
        .filter((eventItem) => eventItem?.event_status !== 'ENDED')
        .map(mapProgramFromApi);
      const normalizedVaccines = Array.isArray(vaccineResults) ? vaccineResults : [];

      setPrograms(upcomingPrograms);
      setDistrictOptions(Array.isArray(districtResults) ? districtResults : []);
      setProgramVaccineOptions(normalizedVaccines);

    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Could not load programs. Please refresh and try again.';
      setProgramError(message);
    } finally {
      setIsProgramsLoading(false);
    }
  };

  const loadCitizens = async () => {
    setIsCitizensLoading(true);
    try {
      const response = await fetchHealthcareUsers({ page_size: 200 });
      const userResults =
        response?.data?.results ||
        response?.data?.data?.results ||
        response?.data?.data ||
        response?.data ||
        [];
      const users = Array.isArray(userResults) ? userResults : [];
      setCitizens(users.map(mapCitizenFromApi));
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        'Could not load citizens. Please refresh and try again.';
      setCitizenError(message);
    } finally {
      setIsCitizensLoading(false);
    }
  };

  useEffect(() => {
    loadCitizens();
    loadPrograms();
  }, []);

  const handleProgramSubmit = async (event) => {
    event.preventDefault();

    const selectedDistrict = districtOptions.find(
      (district) => district?.name?.toLowerCase() === programForm.location.trim().toLowerCase(),
    );

    if (!programForm.name || !programForm.location || !programForm.date || !programForm.targetGroup) {
      setProgramError('Program name, date, location, and target group are required.');
      return;
    }

    if (!programForm.vaccineIds.length) {
      setProgramError('Select at least one vaccine.');
      return;
    }

    if (!EVENT_STATUS_OPTIONS.includes(programForm.eventStatus)) {
      setProgramError('Please select a valid event status.');
      return;
    }

    if (!selectedDistrict?.id) {
      setProgramError('Please select a valid district for location.');
      return;
    }

    let resolvedVaccinationIds = [];
    try {
      const resolved = await Promise.all(
        programForm.vaccineIds.map(async (id) => {
          const parsedId = Number(id);
          if (!Number.isNaN(parsedId) && Number.isFinite(parsedId)) {
            return parsedId;
          }

          const localMatch = localVaccineOptions.find((item) => String(item.id) === String(id));
          if (!localMatch) {
            return null;
          }

          const createResponse = await createProgramVaccine({
            vaccination_name: localMatch.vaccination_name,
            vaccination_dosage: Number(localMatch.vaccination_dosage) || 1,
            status: 'AVAILABLE',
          });
          const created = createResponse?.data?.data || createResponse?.data || {};
          return created?.id || null;
        }),
      );
      resolvedVaccinationIds = resolved.filter((value) => Number.isFinite(Number(value))).map((value) => Number(value));
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.message ||
        'Could not create selected vaccines. Please re-login and try again.';
      setProgramError(message);
      return;
    }

    if (!resolvedVaccinationIds.length) {
      setProgramError('Please select at least one valid vaccine.');
      return;
    }

    const payload = {
      name: programForm.name.trim(),
      event_status: programForm.eventStatus,
      event_location: selectedDistrict.id,
      description: [
        `Date: ${programForm.date}`,
        `Target Group: ${programForm.targetGroup.trim()}`,
        `Notes: ${(programForm.notes || '').trim() || 'None'}`,
      ].join('\n'),
      vaccination_ids: resolvedVaccinationIds,
    };

    setIsProgramSubmitting(true);
    setProgramError('');
    setProgramSuccess('');

    try {
      await createProgram(payload);
      setProgramSuccess('Program created successfully.');
      setProgramForm({
        name: '',
        date: '',
        location: '',
        targetGroup: '',
        notes: '',
        eventStatus: 'NOT_STARTED',
        vaccineIds: [],
      });
      await loadPrograms();
      setActiveSection('programs');
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Program creation failed. Please try again.';
      setProgramError(message);
    } finally {
      setIsProgramSubmitting(false);
    }
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

    if (!payload.name || !payload.email || !payload.phone_number || !payload.date_of_birth || !payload.region) {
      setCitizenError('Name, email, phone number, date of birth, and district are required.');
      return;
    }

    const isValidDistrict = NEPAL_DISTRICTS.some(
      (district) => district.toLowerCase() === payload.region.toLowerCase(),
    );
    if (!isValidDistrict) {
      setCitizenError('Please select a valid district from Nepal\'s 77 districts.');
      return;
    }

    setIsCitizenSubmitting(true);
    setCitizenError('');
    setCitizenSuccess('');

    try {
      const response = await registerHealthcareUser(payload);
      const createdUser = response?.data?.user || {};
      const loginId = response?.data?.login_id || createdUser?.login_id || '';

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
      await loadCitizens();
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

  const handleAddPredefinedVaccine = () => {
    setProgramError('');
    addVaccineToSelection(selectedPredefinedVaccine, 1);
  };

  const handleAddCustomVaccine = () => {
    if (!customVaccineName.trim()) {
      setProgramError('Enter a custom vaccine name first.');
      return;
    }
    setProgramError('');
    addVaccineToSelection(customVaccineName.trim(), 1);
    setCustomVaccineName('');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'programs':
        return (
          <HCProgramsSection
            programs={programs}
            programForm={programForm}
            districtOptions={districtOptions}
            vaccineOptions={mergedVaccineOptions}
            predefinedVaccineOptions={defaultVaccines.map((item) => item.vaccination_name)}
            selectedPredefinedVaccine={selectedPredefinedVaccine}
            customVaccineName={customVaccineName}
            eventStatusOptions={EVENT_STATUS_OPTIONS}
            onProgramChange={handleProgramChange}
            onProgramSubmit={handleProgramSubmit}
            onSelectPredefinedVaccine={setSelectedPredefinedVaccine}
            onAddPredefinedVaccine={handleAddPredefinedVaccine}
            onCustomVaccineNameChange={setCustomVaccineName}
            onAddCustomVaccine={handleAddCustomVaccine}
            onReloadVaccines={loadPrograms}
            onGoToCitizens={() => setActiveSection('citizens')}
            isLoading={isProgramsLoading}
            isSubmitting={isProgramSubmitting}
            isVaccineSubmitting={isVaccineSubmitting}
            vaccineLoadError={vaccineLoadError}
            error={programError}
            success={programSuccess}
          />
        );
      case 'citizens':
        return (
          <HCCitizensSection
            citizens={citizens}
            citizenForm={citizenForm}
            districtOptions={NEPAL_DISTRICTS}
            onCitizenChange={handleCitizenChange}
            onCitizenSubmit={handleCitizenSubmit}
            isSubmitting={isCitizenSubmitting}
            isCitizensLoading={isCitizensLoading}
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