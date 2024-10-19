import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '5s',
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
  http.post('http://localhost:8000/api/v1/posts/create', JSON.stringify({
    content: 'This is a test post',
    videoUrl: '',
    imageUrl: '',
  }),{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjcwOGU2NWIyYmE3NmZhNTYxNDgyN2U0IiwiZW1haWwiOiJwYW5kZXlhbnNhbDc3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYW5zYWxwYW5kZXkifSwiaWF0IjoxNzI4NjM2NTE0LCJleHAiOjE3Mjk5MzI1MTR9.4Fye-qWaW_yvz22P0GBHas7EUgFqgBr_V1h4k7-HbeY"
    },
  });

  // const url = 'http://localhost:8000/api/v1/notifications/';
  // const payload = JSON.stringify({
  //   userId: '66ffeade0554a3353bffadd1',
  //   message: 'This is a test notification',
  //   link: 'http://localhost:8000',
  //   read: "true"
  // });

  // const params = {
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // };

  // const res = http.post(url, payload, params);
  // console.log(res.body);
  sleep(1);
}