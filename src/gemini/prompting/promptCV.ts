import type {StreamingApi} from "hono/utils/stream";
import {type Candidate, GoogleGenAI, type Part, type SchemaUnion} from "@google/genai";
import {CVPersonalInfoSchema} from "../../../schemas/CVPersonalInfoSchema.js";
import {CVExperienceSchema} from "../../../schemas/CVExperienceSchema.js";
import {CVSection} from "../../types/CVSection.js";
import {CVEducationSchema} from "../../../schemas/CVEducationSchema.js";
import {loadTextFile} from "../../util/loadTextFile.js";

const schemas = {
    [CVSection.PersonalInfo]: CVPersonalInfoSchema,
    [CVSection.Experience]: CVExperienceSchema,
    [CVSection.Education]: CVEducationSchema
}

const systemPrompts = {
    [CVSection.PersonalInfo]: loadTextFile("../../prompts/CVPersonalInfoPrompt.md"),
    [CVSection.Experience]: loadTextFile("../../prompts/CVExperiencePrompt.md"),
    [CVSection.Education]: loadTextFile("../../prompts/CVEducationPrompt.md"),
}

export async function promptCV(text: string, language: string, streamClient: StreamingApi) {
    const [personalInfo, experience, education] = await Promise.all([
        runPrompt(CVSection.PersonalInfo, text, language, streamClient),
        runPrompt(CVSection.Experience, text, language, streamClient),
        runPrompt(CVSection.Education, text, language, streamClient)
    ])
}

async function runPrompt(section: CVSection, userInput: string, language: string, streamClient: StreamingApi) {
    const schema: SchemaUnion | undefined = schemas[section]
    const systemPrompt: string | undefined = systemPrompts[section]
    if (schema === undefined || systemPrompt === undefined) throw new Error("Missing schema or system prompt for section " + section)
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: userInput,
        config: {
            systemInstruction: systemPrompt
                .replace("{LANGUAGE}", language),
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    for await (const chunk of response) {
        const candidates: Candidate[] | undefined = chunk.candidates
        if (!candidates) continue
        const content: Part[] | undefined = candidates[0].content?.parts
        if (!content) continue
        const text: string | undefined = content[0].text
        if (!text) continue
        await streamClient.write(`${JSON.stringify({section, text})}</item>`)
    }
}
