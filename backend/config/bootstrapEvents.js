import Event from '../models/Event.js';

const sampleEvents = [
  {
    title: 'Mumbai Tech Summit 2026',
    slug: 'mumbai-tech-summit-2026',
    description:
      'A flagship technology conference featuring product talks, developer sessions, startup showcases, and networking opportunities.',
    category: 'Conference',
    venue: 'NESCO Exhibition Centre',
    city: 'Mumbai',
    organizerName: 'Smart Event Collective',
    startDate: new Date('2026-09-12T10:00:00.000Z'),
    endDate: new Date('2026-09-12T18:00:00.000Z'),
    price: 1499,
    totalTickets: 500,
    availableTickets: 184,
    status: 'published',
    featured: true
  },
  {
    title: 'Campus Cultural Fest',
    slug: 'campus-cultural-fest',
    description:
      'An all-day college celebration with music performances, creative competitions, food zones, and evening headline acts.',
    category: 'Festival',
    venue: 'University Main Ground',
    city: 'Pune',
    organizerName: 'Student Council',
    startDate: new Date('2026-10-03T09:00:00.000Z'),
    endDate: new Date('2026-10-03T21:00:00.000Z'),
    price: 399,
    totalTickets: 1200,
    availableTickets: 640,
    status: 'published',
    featured: true
  },
  {
    title: 'Startup Networking Evening',
    slug: 'startup-networking-evening',
    description:
      'A curated meetup for founders, builders, and investors with keynote sessions, panel discussions, and networking tables.',
    category: 'Networking',
    venue: 'CoLab Business Hub',
    city: 'Bengaluru',
    organizerName: 'LaunchPad Circle',
    startDate: new Date('2026-08-21T14:00:00.000Z'),
    endDate: new Date('2026-08-21T19:30:00.000Z'),
    price: 799,
    totalTickets: 250,
    availableTickets: 72,
    status: 'published',
    featured: true
  }
];

const bootstrapEvents = async () => {
  const existingEvents = await Event.countDocuments();

  if (existingEvents > 0) {
    return;
  }

  await Event.insertMany(sampleEvents);
  console.log('Sample events bootstrapped successfully.');
};

export default bootstrapEvents;
