import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE_URL });

function unwrapError(error) {
  const message =
    error.response?.data?.error || error.message || 'Something went wrong. Please try again.';
  return new Error(message);
}

export async function fetchCapabilities() {
  try {
    const { data } = await client.get('/documents/capabilities');
    return data.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function summarizeDocument({ file, length, mode, onUploadProgress }) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('length', length);
  formData.append('mode', mode);

  try {
    const { data } = await client.post('/documents/summarize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onUploadProgress && evt.total) {
          onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return data.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function summarizeBatch({ files, length }) {
  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));
  formData.append('length', length);

  try {
    const { data } = await client.post('/documents/summarize-batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch (error) {
    throw unwrapError(error);
  }
}
