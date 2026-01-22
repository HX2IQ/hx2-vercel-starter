/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-black",
    "text-white",
    "min-h-screen",
    "border",
    "rounded-2xl",
    "px-4",
    "py-4",
    "shadow-lg",
  ],
  theme: { extend: {} },
  plugins: [],
};
