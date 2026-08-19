/**
 * customerService.js
 * Axios-based API service for the Customer module.
 * Handles all CRUD, file uploads, and status workflow calls.
 */
import api from './api';

const API = '/customers';



// ── Progress callback handler ─────────────────────────────────────────────────
const makeConfig = (onUploadProgress) => ({
    onUploadProgress: onUploadProgress
        ? (e) => onUploadProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH NEXT CUSTOMER ID
// ─────────────────────────────────────────────────────────────────────────────
export const getNextCustomerId = async () => {
    const response = await api.get(`${API}/next-id`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// STANDALONE UPLOAD
// Returns { url, publicId } for a single field
// ─────────────────────────────────────────────────────────────────────────────
export const uploadCustomerFile = async (field, file, onUploadProgress = null, customerId = '') => {
    const data = new FormData();
    data.append(field, file);
    const url = customerId ? `${API}/upload?customerId=${customerId}` : `${API}/upload`;
    const response = await api.post(url, data, makeConfig(onUploadProgress));
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE customer with optional file uploads OR pre-uploaded metadata
// formData: plain object with all text fields + optional Cloudinary metadata
// files: { photo: File|null, aadhaarDoc: File|null, proof2Doc: File|null }
// onUploadProgress: (percent: number) => void
// ─────────────────────────────────────────────────────────────────────────────
export const createCustomer = async (formData, files = {}, onUploadProgress = null) => {
    const data = new FormData();

    // 1. Text fields & Pre-uploaded Cloudinary metadata
    // (backend createCustomer now accepts these in body)
    const allFields = [
        ...Object.keys(formData), // Dynamically include everything in formData
    ];
    
    // De-duplicate and filter
    [...new Set(allFields)].forEach(field => {
        if (formData[field] !== undefined && formData[field] !== null) {
            data.append(field, formData[field]);
        }
    });

    // 2. New Files (if any - will trigger backend upload + cleanup on failure)
    if (files.photo instanceof File)      data.append('photo',      files.photo);
    if (files.aadhaarDoc instanceof File) data.append('aadhaarDoc', files.aadhaarDoc);
    if (files.proof2Doc instanceof File)  data.append('proof2Doc',  files.proof2Doc);

    const response = await api.post(API, data, makeConfig(onUploadProgress));
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET list — supports search, filter, pagination
// params: { page, limit, search, status, gender, city, startDate, endDate, sortBy, sortOrder }
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomers = async (params = {}) => {
    const response = await api.get(API, {
        params,
    });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET single customer by MongoDB _id
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerById = async (id) => {
    const response = await api.get(`${API}/${id}`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE customer text fields (no files)
// ─────────────────────────────────────────────────────────────────────────────
export const updateCustomer = async (id, formData) => {
    const response = await api.put(`${API}/${id}`, formData, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE customer (soft delete — admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCustomer = async (id, { hardDelete = false, deleteReason = '' } = {}) => {
    const params = {};
    if (hardDelete)    params.hardDelete    = 'true';
    if (deleteReason)  params.deleteReason  = deleteReason;
    const response = await api.delete(`${API}/${id}`, {
        params,
    });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD / replace documents for existing customer
// files: { photo?, aadhaarDoc?, proof2Doc? }
// ─────────────────────────────────────────────────────────────────────────────
export const uploadDocuments = async (id, files = {}, onUploadProgress = null) => {
    const data = new FormData();
    if (files.photo)      data.append('photo',      files.photo);
    if (files.aadhaarDoc) data.append('aadhaarDoc', files.aadhaarDoc);
    if (files.proof2Doc)  data.append('proof2Doc',  files.proof2Doc);

    const response = await api.post(`${API}/${id}/documents`, data, makeConfig(onUploadProgress));
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// KYC status progression (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const kycVerifyCustomer = async (id, note = '') => {
    const response = await api.put(
        `${API}/${id}/kyc-verify`,
        { note }
    );
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE customer (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const approveCustomer = async (id, note = '') => {
    const response = await api.put(
        `${API}/${id}/approve`,
        { note }
    );
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT customer with reason (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const rejectCustomer = async (id, reason) => {
    const response = await api.put(
        `${API}/${id}/reject`,
        { reason }
    );
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET audit log (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getCustomerAuditLog = async (id) => {
    const response = await api.get(`${API}/${id}/audit`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET pending customers
// ─────────────────────────────────────────────────────────────────────────────
export const getPendingCustomers = async () => {
    const response = await api.get(`${API}/pending`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE customer by customerId
// ─────────────────────────────────────────────────────────────────────────────
export const approveCustomerByApprovalId = async (customerId, note = '') => {
    const response = await api.put(
        `${API}/approve/${customerId}`,
        { note }
    );
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT customer by customerId
// ─────────────────────────────────────────────────────────────────────────────
export const rejectCustomerByApprovalId = async (customerId, reason) => {
    const response = await api.put(
        `${API}/reject/${customerId}`,
        { reason }
    );
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CUSTOMER APPROVAL MODULE
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminPendingApprovals = async () => {
    const response = await api.get('/customer-approval/pending');
    return response.data;
};

export const processAdminApprovalAction = async (customerId, action, remarks, overrideDuplicate = false) => {
    const response = await api.post(`/customer-approval/action/${customerId}`, {
        action,
        remarks,
        overrideDuplicate
    });
    return response.data;
};
