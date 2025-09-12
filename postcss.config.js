import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: {
    '@tailwindcss/postcss': {}, // ✅ correct in v4
    autoprefixer: {},
  },
};
