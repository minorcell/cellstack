'use client';

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export function ZoomImage(props: any) {
  return (
    <Zoom classDialog="custom-zoom-dialog">
      <img
        {...props}
        className="rounded-lg transition-transform hover:scale-[1.005] w-full h-auto object-cover"
      />
    </Zoom>
  );
}
