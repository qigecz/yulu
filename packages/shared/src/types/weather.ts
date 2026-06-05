export interface Weather {
  temperature: number;
  condition: string;
  windDirection: string;
  windLevel: number;
  pressure: number;
  fishingAdvice: '宜出钓' | '一般' | '不宜';
}
