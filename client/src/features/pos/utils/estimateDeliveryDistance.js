/**
 * Simple heuristic estimate for delivery distance in km to give the cashier a sensible starting point (not a real routing calculation; meant to be edited by the user).
 */
const AREA_DISTANCE_MAP = {
  'model town': 3,
  'faisal town': 4,
  'garden town': 5,
  'gulberg': 6,
  'gulberg iii': 6,
  'johar town': 7,
  'cavalry ground': 8,
  'cantt': 8,
  'lahore cantt': 8,
  'wapda town': 9,
  'dha': 10,
  'dha phase 3': 10,
  'dha phase 5': 12,
};

const DEFAULT_DISTANCE_KM = 5;

export function estimateDistanceKm(customer) {
  if (!customer) return DEFAULT_DISTANCE_KM;

  const area = (customer.area || '').trim().toLowerCase();
  if (area && AREA_DISTANCE_MAP[area] !== undefined) {
    return AREA_DISTANCE_MAP[area];
  }

  return DEFAULT_DISTANCE_KM;
}
