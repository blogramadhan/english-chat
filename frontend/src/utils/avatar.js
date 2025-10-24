/**
 * Get the full URL for an avatar image
 * @param {string} avatarPath - The avatar path stored in database (e.g., "/uploads/avatar-123.jpg")
 * @returns {string} - The full URL to the avatar image
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return ''
  }

  // If the path is already a full URL, return it as is
  if (avatarPath.startsWith('http')) {
    return avatarPath
  }

  // In production, we need to prepend the API URL to the avatar path
  const API_URL = import.meta.env.VITE_API_URL
  if (API_URL) {
    // Remove /api from API_URL if it exists, and append the avatar path
    const baseUrl = API_URL.replace('/api', '')
    return `${baseUrl}${avatarPath}`
  }

  // In development, Vite proxy will handle the /uploads path
  return avatarPath
}
