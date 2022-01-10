module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // docker grays
        // 16222A
        // 212C33

        "docker-dark-gray-100": "#adbecb",
        "docker-dark-gray-200": "#94abbc",
        "docker-dark-gray-300": "#7794ab",
        "docker-dark-gray-400": "#5b7991",
        "docker-dark-gray-500": "#465c6e",
        "docker-dark-gray-600": "#364754",
        "docker-dark-gray-700": "#27343e",
        "docker-dark-gray-800": "#1c262d",
        "docker-dark-red-100": "#ea8e9a",
        "docker-dark-red-200": "#e36676",
        "docker-dark-red-300": "#dd4659",
        "docker-dark-red-400": "#c32438",
        "docker-dark-red-500": "#bc233c",
        "docker-dark-red-600": "#951c2f",
        "docker-dark-red-700": "#741624",
        "docker-dark-red-800": "#58111b",

        // light mode grays
        "docker-gray-800": "#17191E",
        "docker-gray-700": "#393F49",
        "docker-gray-600": "#505968",
        "docker-gray-500": "#677285",
        "docker-gray-400": "#8993A5",
        "docker-gray-300": "#C4C8D1",
        "docker-gray-200": "#E1E2E6",
        "docker-gray-100": "#F9F9FA",
      },
      boxShadow: {
        avatar:
          "0 0 0 1px rgba(136, 152, 170, 0.5), 0 4px 1px rgba(49, 49, 93, 0.1)",
        dialog: "0 10px 40px rgba(0,0,0,0.12), 0 0 16px rgba(0,0,0,0.08)",
        popover:
          "0 0 0 1px rgba(136, 152, 170, 0.1), 0 15px 35px 0 rgba(49, 49, 93, 0.1), 0 5px 15px 0 rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "scale-in": "scale-in 120ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-out": "scale-out 120ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "scale-in": {
          "0%": {
            transform: "scale(0.94)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "scale-out": {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(0.94)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
}
