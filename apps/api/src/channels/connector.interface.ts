export interface AvailabilityPush {
  roomTypeId: string;
  date: string;
  availableRooms: number;
  totalRooms: number;
  price?: number;
  currency?: string;
}

export interface RatePush {
  roomTypeId: string;
  date: string;
  price: number;
  currency?: string;
}

export interface OtaBooking {
  id: string;
  channelBookingId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  roomTypeId: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface ChannelStatus {
  connected: boolean;
  lastSyncAt?: string;
  lastError?: string;
}

export interface OTAConnector {
  readonly channelName: string;
  pushAvailability(
    hotelId: string,
    availability: AvailabilityPush[],
  ): Promise<{ success: boolean; errors?: string[] }>;
  pushRates(
    hotelId: string,
    rates: RatePush[],
  ): Promise<{ success: boolean; errors?: string[] }>;
  pullBookings(
    hotelId: string,
    from: string,
    to: string,
  ): Promise<OtaBooking[]>;
  checkStatus(hotelId: string): Promise<ChannelStatus>;
}
