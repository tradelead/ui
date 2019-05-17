import { useState, useEffect } from 'react';

export default function useTraderImg(trader, size) {
  const defaultProfileThumbnail = `${process.env.PUBLIC_URL}/imgs/default-profile-thumbnail.png`;
  const [profileThumbnail, setProfileThumbnail] = useState(defaultProfileThumbnail);

  useEffect(() => {
    (async () => {
      if (trader.id) {
        const info = await trader.get([{ key: 'profilePhoto', size }]);
        if (info && info.profilePhoto) {
          setProfileThumbnail(info.profilePhoto.url);
        }
      }
    })();
  }, [trader.id]);

  return profileThumbnail;
}
