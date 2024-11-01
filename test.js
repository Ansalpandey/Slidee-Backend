import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 30,
  duration: "1m",
  cloud: {
    // Project: slidee-backend
    projectID: 3713148,
    // Test runs with the same name groups test runs together.
    name: "Test (08/09/2024-18:24:16)",
  },
  // scenarios: {
  //   contacts: {
  //     executor: 'ramping-vus',
  //     startVUs: 0,
  //     stages: [
  //       { duration: '10m', target: 3000},
  //       { duration: '10m', target: 1000},
  //     ],
  //     gracefulRampDown: '0s',
  //   },
  // }
  // thresholds: {
  //   http_req_failed: ['rate<0.01'], // http errors should be less than 1%
  //   http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  // },
};

export default function () {
  http.post(
    "http://localhost:8000/api/v1/posts/create",
    JSON.stringify({
      content: "This is a test post",
      videoUrl: "",
      imageUrl: "",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjcxYjYzMGM3M2Y5MmYwMzhhOTI5YTBkIiwiZW1haWwiOiJwYW5kZXlhbnNhbDc3QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYW5zYWxwYW5kZXkifSwiaWF0IjoxNzI5ODQ5NzYxLCJleHAiOjE3MzExNDU3NjF9.d-JpMixNdEs1iJhoqpT-hZYd0hF8a2CMN_vjQk2BWSU",
      },
    }
  );

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

  // http.post("http://localhost:8080/users", JSON.stringify({
  //   name: "test",
  //   email: "test@gmail.com"
  // }), {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });

  // http.get("http://localhost:8080/");
  sleep(1);
}
