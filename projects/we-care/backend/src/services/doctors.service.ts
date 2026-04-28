import { HttpError } from "../lib/http-error";
import { createSupabaseUserClient, supabase } from "../lib/supabase";
import {
  listLookupNames,
  normalizeLookupValue,
  resolveLookupId,
  resolveLookupName,
} from "./lookup-service";

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60;
const STORAGE_OBJECT_NOT_FOUND = "Object not found";

interface UpdateDoctorProfileInput {
  full_name?: string;
  email?: string;
  contact_number?: string;
  specialty?: string;
  license_number?: string;
  hospital?: string;
}

type DoctorRow = {
  id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  license_number: string | null;
  avatar_url: string | null;
  created_at: string;
  specialty_id: string | null;
  hospital_id: string | null;
};

async function resolveAvatarUrl(avatarValue: string | null) {
  if (!avatarValue) {
    return null;
  }

  if (avatarValue.startsWith("http://") || avatarValue.startsWith("https://")) {
    return avatarValue;
  }

  const { data, error } = await supabase.storage
    .from("doctor-profiles")
    .createSignedUrl(avatarValue, AVATAR_SIGNED_URL_TTL_SECONDS);

  if (error) {
    if (error.message.includes(STORAGE_OBJECT_NOT_FOUND)) {
      return null;
    }
    throw new HttpError(500, error.message);
  }

  return data.signedUrl;
}

async function mapDoctorProfile(row: DoctorRow) {
  const [specialty, hospital, avatarUrl] = await Promise.all([
    resolveLookupName("specialties", row.specialty_id),
    resolveLookupName("hospitals", row.hospital_id),
    resolveAvatarUrl(row.avatar_url),
  ]);

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    contact_number: row.contact_number,
    specialty,
    license_number: row.license_number,
    hospital,
    avatar_url: avatarUrl,
    created_at: row.created_at,
  };
}

export async function uploadAvatar(
  doctorId: string,
  fileBuffer: Buffer,
  mimeType: string,
  accessToken: string,
) {
  if (!ALLOWED_AVATAR_MIME_TYPES.has(mimeType)) {
    throw new HttpError(
      400,
      "Unsupported avatar type. Allowed: JPEG, PNG, WEBP",
    );
  }

  if (fileBuffer.length > MAX_AVATAR_SIZE_BYTES) {
    throw new HttpError(400, "Avatar file is too large. Maximum size is 5MB");
  }

  const fileExtension = mimeType.split("/")[1] ?? "jpg";
  const filePath = `avatars/${doctorId}.${fileExtension}`;
  const doctorStorage = createSupabaseUserClient(accessToken);

  const { error: uploadError } = await doctorStorage.storage
    .from("doctor-profiles")
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) throw new HttpError(500, uploadError.message);

  const { data: signedUrlData, error: signedUrlError } = await doctorStorage.storage
    .from("doctor-profiles")
    .createSignedUrl(filePath, AVATAR_SIGNED_URL_TTL_SECONDS);

  if (signedUrlError) throw new HttpError(500, signedUrlError.message);

  const { error: updateError } = await supabase
    .from("doctors")
    .update({ avatar_url: filePath })
    .eq("id", doctorId);

  if (updateError) throw new HttpError(500, updateError.message);

  return { avatar_url: signedUrlData.signedUrl };
}

export async function getDoctorProfileLookups() {
  const [specialties, hospitals] = await Promise.all([
    listLookupNames("specialties"),
    listLookupNames("hospitals"),
  ]);

  return { specialties, hospitals };
}

export async function updateDoctorProfile(
  doctorId: string,
  updates: UpdateDoctorProfileInput,
) {
  const nextUpdates: Record<string, string | null> = {};

  if (updates.full_name !== undefined) {
    const fullName = updates.full_name.trim();
    if (!fullName) {
      throw new HttpError(400, "Full name is required");
    }
    nextUpdates.full_name = fullName;
  }

  if (updates.email !== undefined) {
    const email = updates.email.trim().toLowerCase();
    if (!email) {
      throw new HttpError(400, "Email is required");
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new HttpError(400, "Email address is invalid");
    }
    nextUpdates.email = email;
  }

  if (updates.contact_number !== undefined) {
    nextUpdates.contact_number = normalizeLookupValue(updates.contact_number);
  }

  if (updates.specialty !== undefined) {
    nextUpdates.specialty_id = await resolveLookupId(
      "specialties",
      updates.specialty,
    );
  }

  if (updates.hospital !== undefined) {
    nextUpdates.hospital_id = await resolveLookupId(
      "hospitals",
      updates.hospital,
    );
  }

  if (updates.license_number !== undefined) {
    nextUpdates.license_number = normalizeLookupValue(updates.license_number);
  }

  if (!Object.keys(nextUpdates).length) {
    throw new HttpError(400, "At least one valid profile field is required");
  }

  const { data, error } = await supabase
    .from("doctors")
    .update(nextUpdates)
    .eq("id", doctorId)
    .select(
      "id, full_name, email, contact_number, specialty_id, license_number, avatar_url, hospital_id, created_at",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new HttpError(409, "A doctor with that email already exists");
    }
    throw new HttpError(500, error.message);
  }

  if (!data) {
    throw new HttpError(404, "Doctor profile not found");
  }

  return await mapDoctorProfile(data as DoctorRow);
}

export async function getDoctorProfile(doctorId: string) {
  const { data, error } = await supabase
    .from("doctors")
    .select(
      "id, full_name, email, contact_number, specialty_id, license_number, avatar_url, hospital_id, created_at",
    )
    .eq("id", doctorId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new HttpError(404, "Doctor profile not found");
    }
    throw new HttpError(500, error.message);
  }

  if (!data) {
    throw new HttpError(404, "Doctor profile not found");
  }

  return await mapDoctorProfile(data as DoctorRow);
}

export async function getDoctorProfileById(doctorId: string) {
  return await getDoctorProfile(doctorId);
}
