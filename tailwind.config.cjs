/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                "slide-in-down": {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(-10px) scale(0.95)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0) scale(1)",
                    },
                },
            },
            animation: {
                "slide-in-down":
                    "slide-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
