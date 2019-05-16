import { useState, useEffect } from 'react';

export default function useTraderImg(trader, size) {
  const defaultProfileThumbnail = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
  const [profileThumbnail, setProfileThumbnail] = useState(defaultProfileThumbnail);

  useEffect(() => {
    (async () => {
      if (trader.id) {
        const image = await trader.get('profilePhoto', { size });
        if (image) {
          setProfileThumbnail(image.url);
        }
      }
    })();
  }, [trader.id]);

  return profileThumbnail;
}