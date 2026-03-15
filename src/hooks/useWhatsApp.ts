import { useState, useCallback } from 'react';
import { getWhatsAppStatus, sendWhatsApp } from '../services/api';

export interface WhatsAppStatus {
  connected: boolean;
  provider: string;
}

export function useWhatsApp() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await getWhatsAppStatus();
      setStatus(data);
    } catch {
      setStatus({ connected: false, provider: 'Twilio' });
    }
  }, []);

  const send = useCallback(
    async (donationId: string): Promise<{ success: boolean; error?: string }> => {
      setSending(true);
      setError(null);
      try {
        const { data } = await sendWhatsApp(donationId);
        if (!data.success) {
          setError(data.error ?? 'Send failed');
        }
        return data;
      } catch (err: any) {
        const msg: string =
          err?.response?.data?.message ?? err?.message ?? 'Failed to send WhatsApp';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSending(false);
      }
    },
    [],
  );

  return { status, sending, error, checkStatus, send };
}
