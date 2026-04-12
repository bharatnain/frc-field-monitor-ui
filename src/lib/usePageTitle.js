import { useEffect } from 'react';

const APP_NAME = 'FIRST Field Monitor';

export default function usePageTitle(pageName) {
  useEffect(() => {
    document.title = pageName ? `${pageName} - ${APP_NAME}` : APP_NAME;
  }, [pageName]);
}
