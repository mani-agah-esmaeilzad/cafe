const DATA_URL_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i;

export const isDataUrl = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }
  return DATA_URL_PATTERN.test(value.trim());
};

export const isValidHttpImageUrl = (value?: string | null): boolean => {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export const isValidImageUrl = (value?: string | null): boolean => {
  if (!value) {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return isValidHttpImageUrl(trimmed) || isDataUrl(trimmed);
};
