// components/magicui/globe.js
import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function Globe({ className = '', config = {} }) {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 400 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
      },
      ...config,
    });

    return () => {
      globe.destroy();
    };
  }, [config]);

  return <canvas ref={canvasRef} className={className} />;
}