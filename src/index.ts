import {serve} from "@hono/node-server"
import {type Context, Hono} from "hono"
import {promptCV} from "./gemini/prompting/promptCV.js";
import type {StreamingApi} from "hono/utils/stream";
import {streamText} from "hono/streaming";
import {cors} from "hono/cors";

const app = new Hono()

app.use(cors({
    origin: "http://localhost:5173",
    allowHeaders: ["*"],
    allowMethods: ["*"],
    exposeHeaders: []
}))

app.post("/", async (c: Context) => {
    const body = await c.req.json()
    const text = body.text as string
    let language = (body.language as string | undefined) || "English"
    if (!text || text.length === 0) return c.status(400)

    return streamText(c, async (stream: StreamingApi) => {
        await promptCV(text, language, stream)
        stream.close()
    })
})


const port = process.env.PORT || 3000
serve({
    fetch: app.fetch,
    port: Number(port)
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})

