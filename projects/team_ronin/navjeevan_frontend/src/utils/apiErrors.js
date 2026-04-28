const DEFAULT_MESSAGE = 'An unexpected error occurred. Please try again.';

const formatFieldErrors = (data, beautifyFieldNames) => {
  if (!data || typeof data !== 'object' || data.detail || data.error || data.message) {
    return '';
  }

  return Object.entries(data)
    .map(([field, msgs]) => {
      const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
      const normalizedField = beautifyFieldNames
        ? field.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
        : field;
      return `${normalizedField}: ${message}`;
    })
    .join(' | ');
};

export const extractApiErrorMessage = (error, options = {}) => {
  const {
    fallbackMessage = DEFAULT_MESSAGE,
    statusMessages = {},
    beautifyFieldNames = false,
  } = options;

  if (!error) {
    return fallbackMessage;
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again later.';
  }

  if (error.response) {
    const { status, data } = error.response;
    if (status === 400) {
      const fieldErrors = formatFieldErrors(data, beautifyFieldNames);
      if (fieldErrors) {
        return fieldErrors;
      }
    }

    return statusMessages[status] || data?.detail || data?.error || data?.message || fallbackMessage;
  }

  if (error.request) {
    return 'No response from server. Please check your connection and try again.';
  }

  return error.message || fallbackMessage;
};
