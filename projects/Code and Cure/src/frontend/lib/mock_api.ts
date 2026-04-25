export type Role = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  lat: number;
  lng: number;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  status: "upcoming" | "completed";
}

export const mockApi = {
  login: async (role: Role): Promise<{ token: string; user: User }> => {
    return {
      token: JSON.stringify({ role }),
      user: {
        id: "1",
        name: role === "patient" ? "John Patient" : "Dr. Smith",
        role,
      },
    };
  },

  getDoctors: async (): Promise<Doctor[]> => {
    return [
      {
        id: "1",
        name: "Dr. Smith",
        specialty: "Cardiology",
        lat: 30.2672,
        lng: -97.7431,
      },
      {
        id: "2",
        name: "Dr. Lee",
        specialty: "Dermatology",
        lat: 30.27,
        lng: -97.74,
      },
    ];
  },

  getAppointments: async (): Promise<Appointment[]> => {
    return [
      {
        id: "1",
        patientName: "John Patient",
        doctorName: "Dr. Smith",
        time: "10:00 AM",
        status: "upcoming",
      },
    ];
  },
};