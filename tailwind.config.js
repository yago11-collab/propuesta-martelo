/** @type {import('tailwindcss').Config} */
// Paleta "Dirección A · La fachada de siempre" (ver identidad-visual-martelo.md).
// Los HEX son aproximaciones de los colores del rótulo: [CONFIRMAR: colores corporativos].
module.exports = {
  content: ['./public/**/*.html', './public/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        azul: { DEFAULT: '#1F4E9E', 700: '#1A4287', 800: '#163872', 50: '#EEF3FB' },
        marino: { DEFAULT: '#16264D', 900: '#0F1B38' },
        fondo: '#F7F7F4',
        texto: '#2B3440',
        suave: '#5A6472',
        linea: '#E3E5E8',
        rojo: { DEFAULT: '#C62832', 700: '#A51F29' },
        amarillo: '#F2C40F',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      maxWidth: { contenido: '72rem' },
    },
  },
  plugins: [],
};
