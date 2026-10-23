
import { createClient } from "redis"

export const redis_client = createClient({
    url: "rediss://default:gQAAAAAAAeLoAAIgcDI2YTliYWQ1NzgxNTc0NDk3ODk0NDQ0NjI4NTU3MzhlMg@elegant-narwhal-123624.upstash.io:6379"
});

export default async function connectionRedis() {
    try {
        await redis_client.connect();
        console.log("Redis Connected Successfully.......😉");
    } catch (error) {
        console.log("Redis Connected Failed......😜😉");
    }
}