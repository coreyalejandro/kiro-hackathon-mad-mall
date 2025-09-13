// Import necessary types
import {
  User,
  Circle,
  Post,
  ComedyClip,
  Product,
  Article,
  Story,
  ActivityItem,
  PlatformStats,
  MallSection,
  ApiResponse,
  PaginatedResponse,
  CircleFilters,
  ComedyFilters,
  ProductFilters,
  ArticleFilters,
  StoryFilters,
  ImageAsset,
} from './types';

// Seed demo data
const seedUsers: User[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    joinedAt: '2022-01-15T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    joinedAt: '2022-02-20T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@example.com',
    joinedAt: '2022-03-10T00:00:00Z',
  },
];

// Function to load data
const loadData = () => {
  let dataStore;

  try {
    const storedData = localStorage.getItem('madmall-data');
    
    if (storedData) {
        dataStore = JSON.parse(storedData);
        // Convert timestamps from string to Date object
        dataStore.activities.forEach(activity => {
          activity.timestamp = new Date(activity.timestamp);
        });
    } else {
      // If no stored data, generate bulk data
      dataStore = generateBulkData();
    }
  } catch (error) {
    console.warn('Failed to load stored data, generating new data');
    dataStore = generateBulkData();
  }

  // Save to localStorage
  localStorage.setItem('madmall-data', JSON.stringify(dataStore));
  return dataStore;
};