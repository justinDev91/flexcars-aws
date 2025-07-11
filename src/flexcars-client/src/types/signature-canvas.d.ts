declare module 'react-signature-canvas' {
  import { Component } from 'react';

  interface SignatureCanvasProps {
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    backgroundColor?: string;
    penColor?: string;
    throttle?: number;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    onBegin?: (event: MouseEvent | TouchEvent) => void;
    onEnd?: (event: MouseEvent | TouchEvent) => void;
  }



  interface SignaturePadInstance {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromDataURL(dataURL: string, options?: { ratio?: number; width?: number; height?: number }): void;
    getCanvas(): HTMLCanvasElement;
  }

  class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(type?: string, encoderOptions?: number): string;
    fromDataURL(dataURL: string, options?: { ratio?: number; width?: number; height?: number }): void;
    getCanvas(): HTMLCanvasElement;
    getSignaturePad(): SignaturePadInstance;
  }

  export default SignatureCanvas;
} 