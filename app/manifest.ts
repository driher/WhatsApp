import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WhatsApp Hotline Radio Sehati",
    short_name: "Radio Sehati",
    description: "Hotline WhatsApp Radio Streaming Sehati",
    start_url: "/",
    display: "standalone",
    background_color: "#202c33",
    theme_color: "#202c33",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}