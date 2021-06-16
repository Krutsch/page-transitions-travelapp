const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  plugins: {
    "postcss-preset-env": {
      stage: false,
      features: {
        "nesting-rules": true,
      },
    },
    tailwindcss: {
      mode: "jit",
      purge: {
        enabled: isProduction,
        content: ["./src/**/*.html", "./src/**/.css,", "./src/**/.ts"],
      },
      darkMode: false,
      theme: {
        extend: {},
      },
      variants: {},
      plugins: [],
    },
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
