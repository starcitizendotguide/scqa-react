/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'sc-blue': {
          '50': '#eff8ff',
          '100': '#ddf2ff',
          '200': '#b4e5ff',
          '300': '#71d1ff',
          '400': '#26bcff',
          '500': '#00a3fe',
          '600': '#0081da',
          '700': '#0066b0',
          '800': '#005791',
          '900': '#034777',
          '950': '#01182a',
        },
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