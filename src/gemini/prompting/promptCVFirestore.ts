import {type Candidate, GoogleGenAI, type Part, type SchemaUnion} from "@google/genai";
import {CVPersonalInfoSchema} from "../../../schemas/CVPersonalInfoSchema.js";
import {CVExperienceSchema} from "../../../schemas/CVExperienceSchema.js";
import {CVSection} from "../../types/CVSection.js";
import {CVEducationSchema} from "../../../schemas/CVEducationSchema.js";
import {loadTextFile} from "../../util/loadTextFile.js";
import {jsonrepair} from "jsonrepair";
import {CollectionReference, DocumentReference, type Firestore} from "@google-cloud/firestore";

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

export async function promptCVFirestore(id: string, text: string, language: string, firestore: Firestore) {
    const collection: CollectionReference = firestore.collection("cv")
    const doc = collection.doc(id)
    await doc.set({status: "generating"})
    await Promise.all([CVSection.PersonalInfo, CVSection.Experience, CVSection.Education]
        .map((section: CVSection): Promise<void> => runPrompt(id, section, text, language, doc)))
    await doc.update({status: "generating"})
}


async function runPrompt(id: string, section: CVSection, userInput: string, language: string, doc: DocumentReference) {
    const schema: SchemaUnion | undefined = schemas[section]
    const systemPrompt: string | undefined = systemPrompts[section]
    if (schema === undefined || systemPrompt === undefined)
        throw new Error("Missing schema or system prompt for section " + section)
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: userInput,
        config: {
            thinkingConfig: {
                thinkingBudget: 0
            },
            systemInstruction: systemPrompt
                .replace("{LANGUAGE}", language),
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    let data = ""
    for await (const chunk of response) {
        const candidates: Candidate[] | undefined = chunk.candidates
        if (!candidates) continue
        const content: Part[] | undefined = candidates[0].content?.parts
        if (!content) continue
        const text: string | undefined = content[0].text
        if (!text) continue
        // Append newly streamed data from LLM
        data += text
        try {
            // Parse and set data
            const parsedData = JSON.parse(jsonrepair(data))
            await doc.update({[section]: parsedData})
        } catch {
        } // Parsing failed, ignore
    }
}
