import React, { useState, useMemo } from "react";
import { Search, Calendar } from 'lucide-react';
import EventTableRow from './EventTableRow';

const EventTable = ({ events = [], onEdit, onDelete, onRegister }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(q) ||
      event.type.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q) ||
      event.status.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 sm:left-3 top-2.5" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Event Details
              </th>
              <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Attendees
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventTableRow
                  key={event._id}
                  event={event}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRegister={onRegister}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-xs sm:text-sm font-medium">No events found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery ? 'Try adjusting your search terms' : 'Create your first event to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {events.length > 0 && (
        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <span>Total: {events.length} events</span>
          <span>Showing: {filteredEvents.length} events</span>
        </div>
      )}
    </div>
  );
};

export default EventTable;