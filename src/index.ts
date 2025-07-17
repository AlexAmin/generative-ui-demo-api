import {serve} from "@hono/node-server"
import {type Context, Hono} from "hono"
import {promptCV} from "./gemini/prompting/promptCV.js";
import type {StreamingApi} from "hono/utils/stream";
import {streamText} from "hono/streaming";
import {cors} from "hono/cors";
import {promptCVFirestore} from "./gemini/prompting/promptCVFirestore";
import * as admin from 'firebase-admin';
import {uuidv4} from "./util/uuid";
import {Firestore} from "@google-cloud/firestore";

admin.initializeApp({projectId: process.env.FIREBASE_PROJECT_ID});
const firestore: Firestore = admin.firestore();

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

app.post("/firestore", async (c: Context) => {
    const body = await c.req.json()
    const text = body.text as string
    let language = (body.language as string | undefined) || "English"
    if (!text || text.length === 0) return c.status(400)
    const id = uuidv4()
    // noinspection ES6MissingAwait - no need to wait
    promptCVFirestore(id, text, language, firestore)
    return c.json({id}, 200)
})


const port = process.env.PORT || 3000
serve({
    fetch: app.fetch,
    port: Number(port)
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})

