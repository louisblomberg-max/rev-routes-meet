import { supabase } from '@/integrations/supabase/client';

export const sendNotification = async ({
  userId, title, body, type, data = {},
}: {
  userId: string; title: string; body: string; type: string; data?: Record<string, any>;
}) => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId, title, body, type, data, read: false,
    });
  } catch { /* non-blocking */ }
};

export const sendNotificationToMany = async ({
  userIds, title, body, type, data = {},
}: {
  userIds: string[]; title: string; body: string; type: string; data?: Record<string, any>;
}) => {
  if (!userIds.length) return;
  try {
    await supabase.from('notifications').insert(
      userIds.map(uid => ({ user_id: uid, title, body, type, data, read: false }))
    );
  } catch { /* non-blocking */ }
};
