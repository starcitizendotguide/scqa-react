/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'sc-blue-900': '#01182a',
        'sc-blue-100': '#58b4f6'
      },
      animation: {
        rotate: "rotate 10s linear infinite",
        typing: "typing 10s steps(100) infinite alternate"
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg) scale(10)" },
          "100%": { transform: "rotate(-360deg) scale(10)" },
        },
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }
        }
      },
    },
  },
  plugins: []
}