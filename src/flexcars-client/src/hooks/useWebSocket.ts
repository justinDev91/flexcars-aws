import { useEffect, useRef, useState, useCallback } from 'react';

export interface VehiclePosition {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface UseWebSocketProps {
  url?: string;
  onVehiclePosition?: (position: VehiclePosition) => void;
  onMessage?: (message: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  onVehiclePosition,
  onMessage,
  onConnect,
  onDisconnect,
  autoConnect = true,
}: UseWebSocketProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Déjà connecté
    }

    try {
      setConnectionState('connecting');
      setError(null);
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        console.log('WebSocket connecté');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Traitement spécifique pour les positions de véhicules
          if (data.type === 'vehicle-position' || data.latitude !== undefined) {
            const position: VehiclePosition = {
              id: data.id || 'unknown',
              latitude: data.latitude,
              longitude: data.longitude,
              timestamp: data.timestamp || new Date().toISOString(),
            };
            onVehiclePosition?.(position);
          }
          
          onMessage?.(data);
        } catch (err) {
          console.error('Erreur lors du parsing du message WebSocket:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setConnectionState('disconnected');
        wsRef.current = null;
        onDisconnect?.();
        
        console.log('WebSocket fermé:', event.code, event.reason);
        
        // Tentative de reconnexion automatique
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Tentative de reconnexion ${reconnectAttemptsRef.current}/${maxReconnectAttempts} dans ${reconnectDelay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current); // Délai progressif
        }
      };

      ws.onerror = (event) => {
        console.error('Erreur WebSocket:', event);
        setError('Erreur de connexion WebSocket');
        setConnectionState('error');
      };

    } catch (err) {
      console.error('Erreur lors de la création de la connexion WebSocket:', err);
      setError('Impossible de créer la connexion WebSocket');
      setConnectionState('error');
    }
  }, [url, onConnect, onDisconnect, onMessage, onVehiclePosition]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Déconnexion manuelle');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message:', err);
        return false;
      }
    }
    console.warn('WebSocket n\'est pas connecté');
    return false;
  }, []);

  // Connexion automatique à l'initialisation
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Nettoyage à la destruction
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionState,
    error,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts,
  };
} 