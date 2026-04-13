import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssNesting from "postcss-nesting";
import postcssPresetEnv from "postcss-preset-env";
import tailwindcss from "tailwindcss";

export default {
  plugins: [
    postcssImport(),
    postcssNesting(),
    postcssPresetEnv({
      stage: 1,
      features: {
        "nesting-rules": false,
      },
    }),
    tailwindcss(),
    autoprefixer(),
  ],
};
