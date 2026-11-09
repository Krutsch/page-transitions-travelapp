import advancedPreset from "cssnano-preset-advanced";
import { Config } from "postcss-load-config";

const isProduction = process.env.NODE_ENV === "production";

export default {
  plugins: {
    "@tailwindcss/postcss": {},
    ...(isProduction
      ? {
          cssnano: {
            preset: advancedPreset,
          },
        }
      : {}),
  },
} satisfies Config;
