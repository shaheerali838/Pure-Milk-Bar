/**
 * Utility to format staff IDs across the application.
 * Replaces raw 24-character MongoDB ObjectIds (e.g. 6ac67b1fc5eafece7b07592a)
 * with a clean human-readable '# ID' format (e.g. #STF-001, #STF-3344173, #STF-592A).
 */
export const isMongoObjectId = (val) => {
  if (!val) return false;
  const str = String(val).trim();
  return /^[0-9a-fA-F]{24}$/.test(str);
};

export const formatStaffId = (staffOrId, fallbackIndex) => {
  if (!staffOrId) {
    if (fallbackIndex !== undefined && fallbackIndex !== null) {
      return `#STF-${String(fallbackIndex + 1).padStart(3, '0')}`;
    }
    return '#STF-001';
  }

  // If staff is an object
  if (typeof staffOrId === 'object') {
    if (staffOrId.displayId && !isMongoObjectId(staffOrId.displayId)) {
      const d = String(staffOrId.displayId).trim();
      return d.startsWith('#') ? d : `#${d}`;
    }

    const code = staffOrId.staffCode;
    if (code && !isMongoObjectId(code)) {
      const c = String(code).trim();
      return c.startsWith('#') ? c : `#${c}`;
    }

    const rawId = String(staffOrId.id || staffOrId._id || staffOrId.staffId || '').trim();
    if (rawId && !isMongoObjectId(rawId)) {
      return rawId.startsWith('#') ? rawId : `#${rawId}`;
    }

    if (isMongoObjectId(rawId)) {
      if (fallbackIndex !== undefined && fallbackIndex !== null) {
        return `#STF-${String(fallbackIndex + 1).padStart(3, '0')}`;
      }
      return `#STF-${rawId.slice(-4).toUpperCase()}`;
    }

    if (fallbackIndex !== undefined && fallbackIndex !== null) {
      return `#STF-${String(fallbackIndex + 1).padStart(3, '0')}`;
    }
    return '#STF-001';
  }

  // If staffOrId is a string or number
  const str = String(staffOrId).trim();
  if (isMongoObjectId(str)) {
    if (fallbackIndex !== undefined && fallbackIndex !== null) {
      return `#STF-${String(fallbackIndex + 1).padStart(3, '0')}`;
    }
    return `#STF-${str.slice(-4).toUpperCase()}`;
  }

  if (str) {
    return str.startsWith('#') ? str : `#${str}`;
  }

  if (fallbackIndex !== undefined && fallbackIndex !== null) {
    return `#STF-${String(fallbackIndex + 1).padStart(3, '0')}`;
  }
  return '#STF-001';
};

export default formatStaffId;
