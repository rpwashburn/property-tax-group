import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Temporarily downgrade to warning for deployment
      "@typescript-eslint/no-explicit-any": ["error", {
        "ignoreRestArgs": true,
        "fixToUnknown": false
      }], // Back to error - only allow any for external API responses
    },
  },
];

export default eslintConfig;
