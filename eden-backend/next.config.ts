import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ce backend vit à côté du site principal : on ancre la racine Turbopack ici
  // pour éviter que Next remonte au lockfile parent.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
