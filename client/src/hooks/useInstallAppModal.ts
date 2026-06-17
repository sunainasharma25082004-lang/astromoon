import { useState, useCallback } from 'react';
import type { ConsultType } from '../components/common/InstallAppModal';

export function useInstallAppModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [consultType, setConsultType] = useState<ConsultType | undefined>();

  const open = useCallback((type?: ConsultType) => {
    setConsultType(type);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, consultType, open, close };
}