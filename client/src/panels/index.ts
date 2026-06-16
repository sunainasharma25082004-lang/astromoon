/**
 * Panel modules — separate folders per role:
 *   panels/user/       → User panel (blue theme)
 *   panels/astrologer/ → Astrologer panel (amber theme)
 *   panels/admin/      → Admin panel (dark theme)
 */
export { default as UserPanelLayout } from './user/Layout';
export { default as AstroPanelLayout } from './astrologer/Layout';
export { default as AdminPanelLayout } from './admin/Layout';