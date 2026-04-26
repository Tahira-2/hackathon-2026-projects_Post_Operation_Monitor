import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "./config";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
  token?: string;
  user?: any;
  [key: string]: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
}

class ApiClient {
  private baseUrl: string = API_BASE_URL;
  private timeout: number = 30000;

  /**
   * Get stored auth token
   */
  private async getToken(customToken?: string): Promise<string | null> {
    if (customToken) {
      return customToken;
    }
    try {
      return await authStorage.getToken();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * Make an HTTP request
   */
  async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
    data?: any,
    customToken?: string,
  ): Promise<T> {
    try {
      const token = await this.getToken(customToken);
      const url = `${this.baseUrl}${endpoint}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (
        data &&
        (method === "POST" || method === "PATCH" || method === "PUT")
      ) {
        options.body = JSON.stringify(data);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          const errorMessage =
            responseData.detail || responseData.message || "An error occurred";
          throw new Error(errorMessage);
        }

        return responseData as T;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile<T>(
    endpoint: string,
    file: any,
    fieldName: string = "file",
    additionalData?: Record<string, any>,
    customToken?: string,
  ): Promise<T> {
    try {
      const token = await this.getToken(customToken);
      const url = `${this.baseUrl}${endpoint}`;

      const formData = new FormData();
      formData.append(fieldName, file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData as any,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || responseData.message || "Upload failed",
        );
      }

      return responseData as T;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }

  // ==================== Auth Endpoints ====================

  async login(username: string, password: string) {
    const response = await this.request("/accounts/login/", "POST", {
      username,
      password,
    });

    // Store token if provided
    if ((response as any).token) {
      await authStorage.setToken((response as any).token);
    }
    if ((response as any).user) {
      await authStorage.setUserData((response as any).user);
    }

    return response;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    role?: "patient" | "doctor";
    phone?: string;
  }) {
    const response = await this.request(
      "/accounts/register/",
      "POST",
      userData,
    );

    // Store token if provided
    if ((response as any).token) {
      await authStorage.setToken((response as any).token);
    }
    if ((response as any).user) {
      await authStorage.setUserData((response as any).user);
    }

    return response;
  }

  async logout() {
    await authStorage.clearAuthData();
  }

  // ==================== Check-in Endpoints ====================

  async getCheckIns() {
    return this.request("/checkins/", "GET");
  }

  async createCheckIn(checkInData: {
    symptoms: string;
    pain_level: number;
    fever: boolean;
    breathing_problem: boolean;
    bleeding: boolean;
  }) {
    return this.request("/checkins/", "POST", checkInData);
  }

  async getCheckInDetail(id: number | string) {
    return this.request(`/checkins/${id}/`, "GET");
  }

  // ==================== Doctor Endpoints ====================

  async getDoctors(filters?: Record<string, any>) {
    let endpoint = "/doctors/";
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      endpoint += `?${params.toString()}`;
    }
    return this.request(endpoint, "GET");
  }

  async getDoctorDetail(id: number | string) {
    return this.request(`/doctors/${id}/`, "GET");
  }

  async getNearbyDoctors() {
    return this.request("/doctors/nearby/", "GET");
  }

  // ==================== Chat Endpoints ====================

  async getMessages() {
    return this.request("/chat/", "GET");
  }

  async sendMessage(messageData: {
    doctor: number;
    message: string;
    is_from_doctor?: boolean;
  }) {
    return this.request("/chat/", "POST", messageData);
  }

  async getMessageDetail(id: number | string) {
    return this.request(`/chat/${id}/`, "GET");
  }

  // ==================== Alert Endpoints ====================

  async getAlerts(filters?: Record<string, any>) {
    let endpoint = "/alerts/";
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      endpoint += `?${params.toString()}`;
    }
    return this.request(endpoint, "GET");
  }

  async getAlertDetail(id: number | string) {
    return this.request(`/alerts/${id}/`, "GET");
  }

  async markAlertAsRead(id: number | string) {
    return this.request(`/alerts/${id}/mark_as_read/`, "POST");
  }

  async getUnreadAlertCount() {
    return this.request("/alerts/unread_count/", "GET");
  }

  async getCriticalAlerts() {
    return this.request("/alerts/critical_alerts/", "GET");
  }

  async acknowledgeAlert(id: number | string) {
    return this.request(`/alerts/${id}/acknowledge/`, "POST");
  }

  async markAllAlertsAsRead() {
    return this.request("/alerts/mark_all_as_read/", "POST");
  }

  // ==================== Medicine Endpoints ====================

  async getMedicines() {
    return this.request("/medicines/", "GET");
  }

  async createMedicine(medicineData: {
    name: string;
    dosage: string;
    frequency: string;
    reminder_time: string;
    start_date: string;
    end_date?: string;
    instructions?: string;
  }) {
    return this.request("/medicines/", "POST", medicineData);
  }

  async getMedicineDetail(id: number | string) {
    return this.request(`/medicines/${id}/`, "GET");
  }

  async updateMedicine(id: number | string, medicineData: Partial<any>) {
    return this.request(`/medicines/${id}/`, "PATCH", medicineData);
  }

  async deleteMedicine(id: number | string) {
    return this.request(`/medicines/${id}/`, "DELETE");
  }

  // ==================== Report Endpoints ====================

  async getReports() {
    return this.request("/reports/", "GET");
  }

  async uploadReport(file: any, fileType: "pdf" | "image") {
    return this.uploadFile("/reports/upload/", file, "file", {
      file_type: fileType,
    });
  }

  async getReportDetail(id: number | string) {
    return this.request(`/reports/${id}/`, "GET");
  }

  async deleteReport(id: number | string) {
    return this.request(`/reports/${id}/`, "DELETE");
  }

  // ==================== Utility Methods ====================

  /**
   * Set base URL (for multi-environment support)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set request timeout
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

// Export singleton instance
export const api = new ApiClient();

export default api;
