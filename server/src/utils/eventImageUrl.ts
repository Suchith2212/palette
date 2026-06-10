import { existsSync } from 'fs';
import path from 'path';

/** Event photos live in server/uploads/exhibition as ev_1 … ev_30 (png for 1–22, jpeg for 23–30). */
export const getEventImageUrl = (eventNumber: number): string => {
  const ext = eventNumber >= 23 ? 'jpeg' : 'png';
  return `/uploads/exhibition/ev_${eventNumber}.${ext}`;
};

export const resolveEventImagePath = (eventNumber: number): string => {
  const uploadsRoot = path.join(__dirname, '../../uploads/exhibition');
  const primaryExt = eventNumber >= 23 ? 'jpeg' : 'png';
  const primary = path.join(uploadsRoot, `ev_${eventNumber}.${primaryExt}`);

  if (existsSync(primary)) {
    return `/uploads/exhibition/ev_${eventNumber}.${primaryExt}`;
  }

  const alternateExt = primaryExt === 'png' ? 'jpeg' : 'png';
  const alternate = path.join(uploadsRoot, `ev_${eventNumber}.${alternateExt}`);
  if (existsSync(alternate)) {
    return `/uploads/exhibition/ev_${eventNumber}.${alternateExt}`;
  }

  return getEventImageUrl(eventNumber);
};
