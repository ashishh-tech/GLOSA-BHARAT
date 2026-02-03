/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                saffron: '#FF9933',
                green_india: '#138808',
                navy_india: '#000080',
            },
            boxShadow: {
                'signal-red': '0 0 25px rgba(220, 38, 38, 0.6)',
                'signal-green': '0 0 25px rgba(22, 163, 74, 0.6)',
                'signal-amber': '0 0 25px rgba(234, 179, 8, 0.6)',
            }
        },
    },
    plugins: [],
}
