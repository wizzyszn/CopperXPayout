const baseUrl = "https://income-api.copperx.io/api";

const routeBaseUrl = {
  auth: `${baseUrl}/auth`,
  kyc: `${baseUrl}/kycs`,
};

// Backend server API client - optimized for server-side usage
// Content types that should be handled as blobs
const contentTypes = [
  "text/csv",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

const options = <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  data?: T,
  token?: string,
  formData?: FormData
): RequestInit => {
  const headers: HeadersInit = formData
    ? {}
    : { "Content-Type": "application/json" };

  if (token) headers.Authorization = `Bearer ${token}`;

  // Basic options object with method and headers
  const requestOptions: RequestInit = { method, headers };

  // Add body only when needed
  if (formData) {
    requestOptions.body = formData;
  } else if (data) {
    requestOptions.body = JSON.stringify(data);
  } else if (["PUT"].includes(method)) {
    throw new Error(`Data must be provided for ${method} requests`);
  }

  return requestOptions;
};

const requestHandler = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    try {
      const errMsg = await response.json();
      throw new Error(`${errMsg.message || "Request failed"}, status: ${response.status}`);
    } catch (e) {
      // If error parsing fails, throw with status code
      if (e instanceof Error && e.message.includes("status:")) {
        throw e;
      }
      throw new Error(`Request failed with status: ${response.status}`);
    }
  }

  const contentType = response.headers.get("Content-Type") || "";
  // Check if content type starts with any of the blob types
  if (contentTypes.some(type => contentType.startsWith(type))) {
    return response.blob() as Promise<T>;
  }
 // console.log("response", await response.json())
  return response.json();
};

const urlGenerator = (
  key: keyof typeof routeBaseUrl,
  path: string,
  isToken = true,
  param: string = "",
  token?: string
) => {
  // Create base URL
  const baseEndpoint = `${routeBaseUrl[key]}/${path}`;
  
  // If no token or param is needed, return the base URL
  if (!isToken && param.length <= 1) {
    return baseEndpoint;
  }
  
  // Build query string
  let queryString = isToken && token ? `token=${encodeURIComponent(token)}` : "";
  
  if (param.length > 1) {
    // Remove the leading '?' if present
    const cleanParam = param.startsWith('?') ? param.substring(1) : param;
    queryString = queryString ? `${queryString}&${cleanParam}` : cleanParam;
  }
  
  return queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;
};

export { urlGenerator, options, requestHandler };