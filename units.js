/* Units: each combines phrase topics (p), vocabulary topics (v) and role-play scenarios (s) about one theme.
 * Exercises for a unit are generated from all of its phrases and words, so every new item adds questions. */
window.UNITS = [
  // People & social
  { key: 'u-social', group: 'People & social', icon: '👋', name: 'Greetings & small talk', blurb: 'Start and keep a friendly chat', p: ['chat', 'greet2', 'intro', 'smalltalk2', 'backchannel'], v: [], s: ['party'] },
  { key: 'u-friends', group: 'People & social', icon: '💞', name: 'Friends, family & love', blurb: 'Relationships, celebrations, hosting', p: ['friendship', 'family', 'dating', 'compliment', 'holidays', 'hosting', 'neighbors', 'people'], v: ['v-family'], s: ['friend-news', 'date', 'dinner'] },
  { key: 'u-feelings', group: 'People & social', icon: '🎭', name: 'Feelings & empathy', blurb: 'Name emotions and comfort others', p: ['emotions', 'empathy', 'react', 'feelings', 'likes'], v: ['v-emotion'], s: ['comfort'] },
  { key: 'u-polite', group: 'People & social', icon: '🙏', name: 'Polite English', blurb: 'Thanks, sorry, requests, advice', p: ['polite', 'apology2', 'thanks2', 'requests', 'softeners', 'accept', 'advice', 'help'], v: [], s: [] },
  // Conversation skills
  { key: 'u-opinions', group: 'Conversation skills', icon: '💬', name: 'Opinions & discussion', blurb: 'Agree, disagree, decide, review', p: ['opinion', 'opinion2', 'certainty', 'decide', 'prefs', 'reviews'], v: ['v-linking'], s: [] },
  { key: 'u-flow', group: 'Conversation skills', icon: '🧩', name: 'Conversation flow', blurb: 'Fillers, stories, clarifying', p: ['discourse', 'clarify', 'thinking', 'story', 'connectors'], v: [], s: [] },
  { key: 'u-spoken', group: 'Conversation skills', icon: '🗣️', name: 'Casual & spoken English', blurb: 'Slang, fast speech, intensifiers', p: ['slang', 'reduced', 'degree', 'time'], v: ['v-slang', 'v-adjectives'], s: [] },
  { key: 'u-expr', group: 'Conversation skills', icon: '🔗', name: 'Idioms & phrasal verbs', blurb: 'Figurative and verb+particle phrases', p: ['idioms', 'idioms2', 'phrasal', 'phrasal2', 'phrasal3', 'phrasal4', 'collocations'], v: ['v-verbs'], s: [] },
  // Daily life
  { key: 'u-cafe', group: 'Daily life', icon: '🍽️', name: 'Food, cafés & restaurants', blurb: 'Order, cook, eat out', p: ['food', 'dining2', 'dining3', 'grocery'], v: ['v-food', 'v-kitchen'], s: ['cafe', 'restaurant'] },
  { key: 'u-shop', group: 'Daily life', icon: '🛍️', name: 'Shopping, money & services', blurb: 'Buy, pay, return, complain', p: ['shop', 'shop2', 'money', 'complaint', 'service', 'errands'], v: ['v-money', 'v-clothes'], s: ['store'] },
  { key: 'u-home', group: 'Daily life', icon: '🏠', name: 'Home & housing', blurb: 'Chores, rent, repairs', p: ['home', 'chores', 'housing'], v: ['v-home', 'v-diy'], s: [] },
  { key: 'u-health', group: 'Daily life', icon: '🩺', name: 'Health & doctor', blurb: 'Symptoms, appointments, advice', p: ['health', 'doctor2'], v: ['v-body', 'v-medical'], s: ['doctor'] },
  { key: 'u-plans', group: 'Daily life', icon: '🗓️', name: 'Plans & schedules', blurb: 'Invite, accept, reschedule', p: ['plans', 'scheduling'], v: ['v-time'], s: ['plans', 'reschedule'] },
  { key: 'u-nature', group: 'Daily life', icon: '🌤️', name: 'Weather, nature & science', blurb: 'The world around you', p: ['weather'], v: ['v-nature', 'v-science'], s: [] },
  // Work & school
  { key: 'u-work', group: 'Work & school', icon: '💼', name: 'Work & meetings', blurb: 'Meetings, projects, feedback', p: ['work', 'workculture', 'meet2', 'project', 'feedback', 'present', 'negotiate'], v: ['v-work', 'v-business'], s: ['office', 'meeting', 'qa', 'brain'] },
  { key: 'u-career', group: 'Work & school', icon: '🎯', name: 'Jobs, email & phone', blurb: 'Interviews, emails, calls', p: ['career', 'jobtalk', 'email', 'phonecall'], v: [], s: ['interview'] },
  { key: 'u-school', group: 'Work & school', icon: '🎓', name: 'School & study', blurb: 'Classes, exams, deadlines', p: ['school'], v: ['v-school'], s: [] },
  // Travel & places
  { key: 'u-travel', group: 'Travel & places', icon: '✈️', name: 'Travel & hotels', blurb: 'Airports, hotels, sightseeing', p: ['travel', 'airport', 'hotel', 'sightsee', 'roadtrip'], v: ['v-travel'], s: ['hotel'] },
  { key: 'u-move', group: 'Travel & places', icon: '🧭', name: 'Getting around', blurb: 'Directions, transit, driving', p: ['directions', 'transit', 'driving'], v: ['v-transport', 'v-city'], s: ['directions', 'car'] },
  // Media & technology
  { key: 'u-tech', group: 'Media & technology', icon: '📱', name: 'Technology & texting', blurb: 'Devices, apps, online life', p: ['tech', 'texting', 'techtalk'], v: ['v-tech', 'v-social'], s: [] },
  { key: 'u-media', group: 'Media & technology', icon: '🎬', name: 'Movies, music & hobbies', blurb: 'Entertainment and sports', p: ['media', 'hobbies'], v: ['v-media', 'v-sports'], s: ['movie'] },
  { key: 'u-world', group: 'Media & technology', icon: '📰', name: 'News, law & emergencies', blurb: 'Words from news and thrillers', p: ['emergency'], v: ['v-news', 'v-law', 'v-emergency'], s: [] },
];
