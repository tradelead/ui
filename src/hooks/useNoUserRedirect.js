import { useContext, useEffect, useState } from 'react';
import AppContext from '../AppContext';

export default function useNoUserRedirect() {
  const { user, auth } = useContext(AppContext);
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await auth.getAccessToken(); // be sure current user loaded before redirecting
        const curUser = await auth.current();
        if (!curUser.id) {
          setRedirect(true);
        }
      } catch (e) {
        setRedirect(true);
      }
    })();
  }, [user]);

  return redirect;
}
