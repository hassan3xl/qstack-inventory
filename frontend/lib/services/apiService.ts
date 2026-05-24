import { getAccessToken } from "../actions/auth.actions";

// development
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const sendMessageEndpoint = process.env.NEXT_PUBLIC_BACKEND_MESSAGE_URL;

// productiont
// const BASE_URL = process.env.NEXT_PUBLIC_PRODUCTION_API_URL;

// Helper to get tenant slug from subdomain
const getTenantSlug = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.host;
  const parts = host.split(".");
  // For dev: subdomain.localhost:3000 -> ["subdomain", "localhost:3000"]
  // For prod: subdomain.myapp.com -> ["subdomain", "myapp", "com"]
  if (
    parts.length >= 2 &&
    (parts[1].includes("localhost") || parts.length > 2)
  ) {
    return parts[0];
  }
  return null;
};

async function fetchWithCatch(
  url: string,
  options: RequestInit = {},
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);

    // For 204 No Content
    if (response.status === 204) {
      return { detail: "No Content" };
    }

    // Try to parse response (could be error JSON)
    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      // If error, throw data so caller .catch gets it
      throw data || { detail: response.statusText };
    }

    return data;
  } catch (error) {
    // Network/parsing errors
    console.log(error);

    throw error;
  }
}

export const apiService = {
  get: async function (url: string): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetchWithCatch(url, {
      method: "GET",
      credentials: "include",
      headers,
    });
  },
  postWithoutToken: async function (url: string, data: any): Promise<any> {
    return fetchWithCatch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  post: async function (url: string, data?: any): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options: RequestInit = {
      method: "POST",
      credentials: "include",
      headers,
    };

    // Only add body if data is provided
    if (data !== undefined) {
      options.body = JSON.stringify(data);
    }

    return fetchWithCatch(url, options);
  },

  postFormData: async function (url: string, formData: FormData): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetchWithCatch(url, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });
  },

  put: async function (url: string, data: any): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetchWithCatch(url, {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },
  patch: async function (url: string, data: any): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetchWithCatch(url, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });
  },

  delete: async function (url: string): Promise<any> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetchWithCatch(url, {
      method: "DELETE",
      headers,
    });
  },
};

export const getBackendErrorMessage = (error: any): string => {
  if (!error) return "An unexpected error occurred.";
  
  if (typeof error === "string") return error;
  
  if (error.detail && typeof error.detail === "string") return error.detail;
  
  if (Array.isArray(error.non_field_errors) && error.non_field_errors.length > 0) {
    return error.non_field_errors[0];
  }

  if (typeof error === "object") {
    const messages: string[] = [];
    for (const key in error) {
      if (Object.prototype.hasOwnProperty.call(error, key)) {
        const val = error[key];
        if (Array.isArray(val)) {
          messages.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          messages.push(`${key}: ${val}`);
        }
      }
    }
    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return error.message || "An unexpected error occurred.";
};
