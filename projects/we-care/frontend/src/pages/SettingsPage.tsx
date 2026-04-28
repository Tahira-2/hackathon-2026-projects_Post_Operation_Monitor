import { ChevronDown } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { StatusToast } from "../components/ui/StatusToast";
import { Button } from "../components/ui/Button";
import { getApiErrorMessage } from "../lib/auth-api";
import {
  useDoctorProfileLookupsQuery,
  useUpdateDoctorProfileMutation,
  useUploadDoctorAvatarMutation,
} from "../lib/auth-hooks";
import { useProfileStore } from "../stores/profileStore";

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

interface ProfileForm {
  fullName: string;
  email: string;
  contactNumber: string;
  licenseNumber: string;
  specialty: string;
  hospital: string;
}

interface StatusMessage {
  message: string;
  tone: "success" | "error";
}

function validateProfileForm(form: ProfileForm) {
  if (!form.fullName.trim()) {
    return "Full name is required.";
  }

  const email = form.email.trim();
  if (!email) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

export default function SettingsPage() {
  const {
    fullName: storedName,
    email: storedEmail,
    contactNumber: storedContactNumber,
    specialty: storedSpecialty,
    licenseNumber: storedLicenseNumber,
    hospital: storedHospital,
    avatarUrl: storedAvatar,
    setProfile,
  } = useProfileStore();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(storedAvatar);
  const [form, setForm] = useState<ProfileForm>({
    fullName: storedName,
    email: storedEmail,
    contactNumber: storedContactNumber,
    licenseNumber: storedLicenseNumber,
    specialty: storedSpecialty,
    hospital: storedHospital,
  });
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doctorLookupsQuery = useDoctorProfileLookupsQuery()
  const updateDoctorProfileMutation = useUpdateDoctorProfileMutation()
  const uploadDoctorAvatarMutation = useUploadDoctorAvatarMutation()

  useEffect(() => {
    setAvatarUrl(storedAvatar);
    setForm({
      fullName: storedName,
      email: storedEmail,
      contactNumber: storedContactNumber,
      licenseNumber: storedLicenseNumber,
      specialty: storedSpecialty,
      hospital: storedHospital,
    });
  }, [
    storedAvatar,
    storedContactNumber,
    storedEmail,
    storedHospital,
    storedLicenseNumber,
    storedName,
    storedSpecialty,
  ]);

  useEffect(() => {
    if (!doctorLookupsQuery.error) return

    setStatusMessage({
      message: getApiErrorMessage(
        doctorLookupsQuery.error,
        "Unable to load profile options. Please refresh and try again.",
      ),
      tone: "error",
    })
  }, [doctorLookupsQuery.error])

  function update(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatusMessage(null);
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
      setStatusMessage({
        message: "Unsupported image type. Please use JPEG, PNG, or WEBP.",
        tone: "error",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setStatusMessage({
        message: "Profile image must be 5MB or smaller.",
        tone: "error",
      });
      e.target.value = "";
      return;
    }

    setStatusMessage(null);
    try {
      await uploadDoctorAvatarMutation.mutateAsync(file);
      setAvatarUrl(useProfileStore.getState().avatarUrl);
      setStatusMessage({ message: "Profile image updated successfully.", tone: "success" });
    } catch (error) {
      setStatusMessage({
        message: getApiErrorMessage(
          error,
          "Unable to upload profile image. Please try again.",
        ),
        tone: "error",
      });
    }
    e.target.value = "";
  }

  async function handleSave() {
    setStatusMessage(null);

    const validationError = validateProfileForm(form);
    if (validationError) {
      setStatusMessage({ message: validationError, tone: "error" });
      return;
    }

    try {
      const updatedDoctor = await updateDoctorProfileMutation.mutateAsync({
        full_name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        contact_number: form.contactNumber.trim(),
        license_number: form.licenseNumber.trim(),
        specialty: form.specialty.trim(),
        hospital: form.hospital.trim(),
      });

      setProfile({
        fullName: updatedDoctor.full_name,
        email: updatedDoctor.email,
        contactNumber: updatedDoctor.contact_number ?? "",
        specialty: updatedDoctor.specialty ?? "",
        licenseNumber: updatedDoctor.license_number ?? "",
        hospital: updatedDoctor.hospital ?? "",
        avatarUrl: updatedDoctor.avatar_url ?? null,
      });
      setAvatarUrl(updatedDoctor.avatar_url ?? null);
      setStatusMessage({
        message: "Profile details updated successfully.",
        tone: "success",
      });
    } catch (error) {
      setStatusMessage({
        message: getApiErrorMessage(
          error,
          "Unable to save profile. Please try again.",
        ),
        tone: "error",
      });
    }
  }

  const specialtyOptions = doctorLookupsQuery.data?.specialties ?? []
  const hospitalOptions = doctorLookupsQuery.data?.hospitals ?? []
  const isLoadingLookups = doctorLookupsQuery.isLoading
  const isSaving = updateDoctorProfileMutation.isPending
  const isUploadingImage = uploadDoctorAvatarMutation.isPending

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1";
  const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Profile</h2>
        <p className="text-sm text-muted mt-1">
          Manage your professional profile.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-5 border-b border-border p-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent hover:opacity-90 transition-opacity overflow-hidden"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-white">
                {form.fullName?.[0] ?? "U"}
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <div>
            <p className="text-md font-semibold text-primary">
              Profile Picture
            </p>
            <p className="text-sm text-muted mt-0.5">
              Upload a professional headshot for your clinician profile.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="mt-2 text-sm font-medium text-accent hover:underline"
            >
              {isUploadingImage ? "Uploading..." : "Choose Image"}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Full Name
              </label>
              <input
                className={inputCls}
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Dr. Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Email
              </label>
              <input
                className={inputCls}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="doctor@hospital.org"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Contact Number
              </label>
              <input
                className={inputCls}
                value={form.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Medical License Number
              </label>
              <input
                className={inputCls}
                value={form.licenseNumber}
                onChange={(e) => update("licenseNumber", e.target.value)}
                placeholder="Enter license number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Specialty
              </label>
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  disabled={isLoadingLookups}
                >
                  <option value="">Select a specialty...</option>
                  {specialtyOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Hospital / Clinic Name
              </label>
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.hospital}
                  onChange={(e) => update("hospital", e.target.value)}
                  disabled={isLoadingLookups}
                >
                  <option value="">
                    {isLoadingLookups
                      ? "Loading hospitals..."
                      : "Select a hospital..."}
                  </option>
                  {hospitalOptions.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button onClick={handleSave} loading={isSaving}>
            Save Profile
          </Button>
        </div>
      </div>

      {statusMessage ? (
        <StatusToast
          message={statusMessage.message}
          tone={statusMessage.tone}
          onClose={() => setStatusMessage(null)}
        />
      ) : null}
    </div>
  );
}
