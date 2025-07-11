declare module '@yudiel/react-qr-scanner' {
  export interface QrScannerProps {
    onDecode: (result: string) => void;
    onError?: (error: Error) => void;
    constraints?: MediaTrackConstraints;
    containerStyle?: React.CSSProperties;
    videoStyle?: React.CSSProperties;
  }

  export const QrScanner: React.FC<QrScannerProps>;
} 