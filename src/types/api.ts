export interface EventStats { total: number; checkedIn: number; absent: number; }
export interface Event {
  id: string; title: string; startsAt: string; endsAt: string; location: string; stats: EventStats;
}
export interface Attendee { id: string; name: string; email?: string; document?: string; checkedInAt?: string | null; }
export interface Paginated<T> { data: T[]; page: number; limit: number; total: number; }
export interface CheckinResponse { attendeeId: string; checkedInAt: string; }
