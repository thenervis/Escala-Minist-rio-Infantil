
import { Room } from './types';

export const INITIAL_ROOMS: Room[] = [
  { id: 'checkin', name: 'Check-in', description: '1 voluntário', capacity: 1 },
  { id: 'grande-grupo', name: 'Grande Grupo', description: '2 voluntários (Louvor/Dinâmica)', capacity: 2 },
  { id: 'bercario', name: 'Berçário', description: '0 a 2 anos (2 voluntários)', capacity: 2 },
  { id: '3-4-anos', name: '3 a 4 anos', description: 'Maternal (2 voluntários)', capacity: 2 },
  { id: '5-6-anos', name: '5 a 6 anos', description: 'Primários I (2 voluntários)', capacity: 2 },
  { id: '7-8-anos', name: '7 a 8 anos', description: 'Primários II (2 voluntários)', capacity: 2 },
  { id: '9-12-anos', name: '9 a 12 anos', description: 'Juniores (2 voluntários)', capacity: 2 }
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
