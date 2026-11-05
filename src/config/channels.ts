export type Channel = {
  id: string;
  name: string;
  href: string;
  icon: string;
  handle: string;
};

export const channels: Channel[] = [
  {
    id: 'shopee',
    name: 'Shopee',
    href: 'https://th.shp.ee/JZBERGTw',
    icon: 'ri-shopping-bag-3-line',
    handle: 'th.shp.ee',
  },
  {
    id: 'line',
    name: 'LINE',
    href: 'https://line.me/R/ti/p/@908feqyl',
    icon: 'ri-chat-3-line',
    handle: '@908feqyl',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61584539214733',
    icon: 'ri-facebook-circle-line',
    handle: 'OYO GOLF',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: 'https://www.instagram.com/onlyone.golf',
    icon: 'ri-instagram-line',
    handle: '@onlyone.golf',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    href: 'https://www.tiktok.com/@onlyone.golf',
    icon: 'ri-tiktok-line',
    handle: '@onlyone.golf',
  },
];

export const lineChannel = channels.find((channel) => channel.id === 'line');

export const mapLink = 'https://maps.app.goo.gl/vu9eqsPvscgrDTDs7';