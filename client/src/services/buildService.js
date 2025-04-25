import api from './api';

// Get all builds for a user
export const getBuilds = async () => {
  const response = await api.get('/builds');
  return response.data;
};

// Get a single build by ID
export const getBuildById = async (id) => {
  const response = await api.get(`/builds/${id}`);
  return response.data;
};

// Create a new build
export const createBuild = async (buildData) => {
  const response = await api.post('/builds', buildData);
  return response.data;
};

// Update a build
export const updateBuild = async (id, buildData) => {
  const response = await api.put(`/builds/${id}`, buildData);
  return response.data;
};

// Delete a build
export const deleteBuild = async (id) => {
  const response = await api.delete(`/builds/${id}`);
  return response.data;
}; 