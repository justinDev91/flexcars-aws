import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { interval } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly baseLat = 48.8809;
  private readonly baseLng = 2.3553;
  private angle = 0;

  onModuleInit() {
    interval(1000).subscribe(() => {
      const radius = 0.002;
      this.angle += 10; 
      const rad = (this.angle * Math.PI) / 180;

      const lat = this.baseLat + radius * Math.cos(rad);
      const lng = this.baseLng + radius * Math.sin(rad);

      //TODO: Get vehicleId from prisma 
      const vehiclePosition = {
        id: '52759906-9347-4a7d-a2db-3ce9788171e8',
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
      };

      this.server.emit('vehicle-position', vehiclePosition);
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any) {
    this.server.emit('message', payload);
  }
}
