import { api } from './client';
import type { Event, Paginated, Attendee, CheckinResponse } from '../types/api';

export async function getEvents() {
  const { data } = await api.get<Event[]>('/events');
  return data;
}

export async function getEvent(id: string) {
  const { data } = await api.get<Event>(`/events/${id}`);
  return data;
}

export async function getAttendees(eventId: string, search = '', page = 1, limit = 20) {
  const { data } = await api.get<Paginated<Attendee>>(`/events/${eventId}/attendees`, {
    params: { search, page, limit },
  });
  return data;
}

export async function postCheckin(eventId: string, attendeeId: string) {
  const { data } = await api.post<CheckinResponse>(`/events/${eventId}/checkin`, { attendeeId });
  return data;
}
