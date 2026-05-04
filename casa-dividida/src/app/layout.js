import './globals.css';

export const metadata = {
  title: 'La Casa Dividida: Cabo de Guerra',
  description: 'Juego educativo multijugador en tiempo real basado en la Revolución Cubana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
