import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 500,
  duration: '5m',
  cloud: {
    // Project: slidee-backend
    projectID: 3713148,
    // Test runs with the same name groups test runs together.
    name: 'Test (08/09/2024-18:24:16)'
  },
  // stages: [
  //   { duration: '2m', target: 2000 }, // fast ramp-up to a high point
  //   // No plateau
  //   { duration: '1m', target: 0 }, // quick ramp-down to 0 users
  // ],
  // thresholds: {
  //   http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  //   http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  // },
};

export default function() {
  // http.get('http://localhost:3000/api/v1/posts');
  // http.get('http://localhost:3000/api/v1/users/profile', {
  //   headers: {
  //     'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjZiMDU3M2E1YzljMTNlNDkxYmRhMmZlIiwiZW1haWwiOiJwYW5kZXlhbnNhbDc3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYW5zYWxwYW5kZXkifSwiaWF0IjoxNzI1ODAzNTU1LCJleHAiOjE3MjcwOTk1NTV9.9lOH4uvRy8iyn9ch74p7fbw0DLzFNhgX0TCKb1jcCbc"
  //   },
  // });
  http.post('http://localhost:3000/api/v1/posts/create', JSON.stringify({
    content: 'Test',
    videoUrl: '',
    imageUrl: '',
  }),{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjZiMDU3M2E1YzljMTNlNDkxYmRhMmZlIiwiZW1haWwiOiJwYW5kZXlhbnNhbDc3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYW5zYWxwYW5kZXkifSwiaWF0IjoxNzI1ODAzNTU1LCJleHAiOjE3MjcwOTk1NTV9.9lOH4uvRy8iyn9ch74p7fbw0DLzFNhgX0TCKb1jcCbc"
    },
  });
  sleep(1);
}