module.exports = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=31536000, stale-while-revalidate',
          },
        ],
      },
    ];
  },
};
