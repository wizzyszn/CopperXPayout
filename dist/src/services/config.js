"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestHandler = exports.options = exports.urlGenerator = void 0;
const baseUrl = "https://income-api.copperx.io/api";
const routeBaseUrl = {
    auth: `${baseUrl}/auth`,
    kyc: `${baseUrl}/kycs`,
    wallets: `${baseUrl}/wallets`,
    transfers: `${baseUrl}/transfers`,
    payees: `${baseUrl}/payees`,
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
const options = (method, data, token, formData) => {
    const headers = formData
        ? {}
        : { "Content-Type": "application/json" };
    if (token)
        headers.Authorization = `Bearer ${token}`;
    // Basic options object with method and headers
    const requestOptions = { method, headers };
    // Add body only when needed
    if (formData) {
        requestOptions.body = formData;
    }
    else if (data) {
        requestOptions.body = JSON.stringify(data);
    }
    else if (["PUT"].includes(method)) {
        throw new Error(`Data must be provided for ${method} requests`);
    }
    return requestOptions;
};
exports.options = options;
const requestHandler = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        try {
            const errMsg = await response.json();
            throw new Error(`${errMsg.message || "Request failed"}, status: ${response.status}`);
        }
        catch (e) {
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
        return response.blob();
    }
    // console.log("response", await response.json())
    return response.json();
};
exports.requestHandler = requestHandler;
const urlGenerator = (key, path, isToken = true, param = "", token) => {
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
exports.urlGenerator = urlGenerator;
