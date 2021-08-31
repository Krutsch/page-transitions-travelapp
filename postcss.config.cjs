const isProduction = process.env.NODE_ENV === "production";
const tailwindcss = require("./tailwind.config.cjs");

module.exports = {
  plugins: {
    "postcss-preset-env": {
      stage: false,
      features: {
        "nesting-rules": true,
      },
    },
    tailwindcss,
    autoprefixer: {},
    ...(isProduction
      ? {
          cssnano: {
            preset: "advanced",
          },
        }
      : {}),
  },
};
