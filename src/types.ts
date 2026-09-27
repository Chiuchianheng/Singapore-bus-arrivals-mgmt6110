export type LoadCode = 'SEA' | 'SDA' | 'LSD';
export type VehicleTypeCode = 'SD' | 'DD' | 'BD';
export type FeatureCode = 'WAB' | '';

export interface BusArrival {
  estimatedMinutes: number; // Minutes until arrival (e.g. 0 for <1 min, 4, 12, etc.)
  load: LoadCode; // SEA (seats available), SDA (standing available), LSD (limited standing)
  type: VehicleTypeCode; // SD (single deck), DD (double deck), BD (bendy)
  feature: FeatureCode; // WAB (wheelchair accessible), or empty
  tracked: boolean; // true = bus GPS tracking, false = timetable schedule estimate
  destinationCode?: string; // 5-digit bus stop code where the bus terminates
}

export interface BusService {
  serviceNo: string;
  destinationCode?: string; // 5-digit bus stop code where the bus terminates
  buses: BusArrival[]; // Up to 3 upcoming buses, some services have only 1 or 2
}

export interface BusStopData {
  stopCode: string;
  services: BusService[];
}

export interface BusStopRecord {
  BusStopCode: string;
  RoadName: string;
  Description: string;
}
