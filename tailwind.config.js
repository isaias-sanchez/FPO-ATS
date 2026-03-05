/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ises: {
                    green: '#99CC33',
                    'green-light': '#b3d966',
                    'green-dark': '#7aa329',
                    blue: '#0099CC',
                    'blue-light': '#33ade6',
                    'blue-dark': '#007a-3', // Fixed hex below
                    'blue-dark': '#007a52',
                    dark: '#333333',
                    gray: '#F4F4F4'
                }
            },
            fontFamily: {
                sans: ['Nunito', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
