/** Plain JSON for socket payloads — avoids Mongoose serialization issues */
export function serializeConsultation(doc) {
  if (!doc) return null;
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  return JSON.parse(JSON.stringify(raw));
}

export const RESOURCES = {
  CONSULTATIONS: 'consultations',
  NOTIFICATIONS: 'notifications',
  WALLET: 'wallet',
  EARNINGS: 'earnings',
  WITHDRAWALS: 'withdrawals',
  REVIEWS: 'reviews',
  APPLICATIONS: 'applications',
  STATS: 'stats',
  USERS: 'users',
  ASTROLOGERS: 'astrologers',
  TRANSACTIONS: 'transactions',
  ORDERS: 'orders',
};

/**
 * Broadcast a panel data refresh signal to role-specific socket rooms.
 * Clients re-fetch only the resource they subscribe to — no full page reload.
 */
export function emitPanelUpdate(io, {
  resource,
  userIds = [],
  astroIds = [],
  admin = false,
  payload = {},
} = {}) {
  if (!io || !resource) return;

  const event = {
    resource,
    ...payload,
    at: Date.now(),
  };

  const uidList = [...new Set(userIds.filter(Boolean).map((id) => String(id)))];
  const aidList = [...new Set(astroIds.filter(Boolean).map((id) => String(id)))];

  uidList.forEach((id) => io.to(`user_${id}`).emit('panel:update', event));
  aidList.forEach((id) => io.to(`astro_${id}`).emit('panel:update', event));
  if (admin) io.to('admin_panel').emit('panel:update', event);
}

export function emitConsultationUpdate(io, consultation, extra = {}) {
  const userId = consultation?.user_id?._id || consultation?.user_id;
  const astroId = consultation?.astrologer_id?._id || consultation?.astrologer_id;

  emitPanelUpdate(io, {
    resource: RESOURCES.CONSULTATIONS,
    userIds: userId ? [String(userId)] : [],
    astroIds: astroId ? [String(astroId)] : [],
    admin: true,
    payload: { consultation: serializeConsultation(consultation), ...extra },
  });
}

/** Direct real-time alert to astrologer — chat / call / video incoming */
export function emitIncomingToAstrologer(io, {
  astroUserId,
  astroProfileId,
  consultation,
  type,
  user,
} = {}) {
  if (!io || !consultation) return;

  const serialized = serializeConsultation(consultation);
  const payload = {
    resource: RESOURCES.CONSULTATIONS,
    action: 'incoming',
    type: type || consultation.type,
    consultation: serialized,
    user: user
      ? {
          full_name: user.full_name,
          _id: user._id,
          avatar_url: user.avatar_url,
        }
      : undefined,
    at: Date.now(),
  };

  const rooms = [];
  if (astroUserId) rooms.push(`user_${String(astroUserId)}`);
  if (astroProfileId) rooms.push(`astro_${String(astroProfileId)}`);

  rooms.forEach((room) => {
    const size = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`[incoming] → ${room} (${size} socket(s))`, payload.type, user?.full_name);
    io.to(room).emit('incoming_consultation', payload);
  });
}