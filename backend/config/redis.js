import Redis from "ioredis";
// Redis client
const client = new Redis(process.env.REDIS_URL);

// Redis emits an 'error' event on connection failure.
// Without this listener, Node will crash with an unhandled error.
client.on("error", (err) => {
  console.log("Redis connection error: ", err);
});

// 'connect' fires once the TCP connection to Redis is established.
client.on("connect", () => {
  console.log("connected to Redis");
});

console.log(process.env.REDIS_URL);
export default client;
