export default {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": "postcss-nesting",
    "postcss-preset-env": {
      stage: 1,
      features: {
        "nesting-rules": false, // handled by postcss-nesting
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
