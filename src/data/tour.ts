// @ts-expect-error - vite ?raw import
import csvRaw from '../../data/Krallice EU Tour 2026 ticket links - Sheet1.csv?raw';

export type TourDate = {
  iso: string;
  dateLabel: string;
  weekday: string;
  venue: string;
  city: string;
  country: string;
  url: string | null;
};

export function getTourDates(): TourDate[] {
  const lines = (csvRaw as string).trim().split(/\r?\n/).slice(1);

  return lines.map((line) => {
    const [d, venue, city, country, url] = line.split(',');
    const [day, month, year] = d.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return {
      iso: date.toISOString().slice(0, 10),
      dateLabel: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      weekday: date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      venue: venue.trim(),
      city: city.trim(),
      country: country.trim(),
      url: cleanUrl(url),
    };
  });
}

function cleanUrl(u: string | undefined): string | null {
  if (!u) return null;
  const t = u.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
