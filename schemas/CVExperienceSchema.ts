import {type Schema, type SchemaUnion, Type} from "@google/genai";

const ExperienceBaseProperties: SchemaUnion = {
    type: Type.OBJECT,
    required: [""],
    properties: {
        startDate: {
            type: Type.STRING,
            description: "Job start date as 'YYYY-MM-DDTHH:mm:ss.sssZ'",
            nullable: true
        },
        endDate: {
            type: Type.STRING,
            description: "Job end date as 'YYYY-MM-DDTHH:mm:ss.sssZ'. Null if the job has not ended yet. ",
            nullable: true
        },
        role: {
            type: Type.STRING,
            description: "Job role / title ",
            nullable: true
        },
        seniority: {
            type: Type.STRING,
            description: "Job seniority level",
            nullable: true
        },
        company: {
            type: Type.STRING,
            description: "Name of the company this job took place at",
            nullable: true
        },
        city: {
            type: Type.STRING,
            description: "City this job took place in",
            nullable: true
        },
        country: {
            type: Type.STRING,
            description: "Country this job took place in as plain text (E.g. Germany, United States, etc)",
            nullable: true
        },
        responsibilities: {
            type: Type.STRING,
            description: "All things the user has done in this job as one detailed text",
            nullable: true
        }
    }
}
ExperienceBaseProperties.required = Object.keys(ExperienceBaseProperties.properties as unknown as object)

export const CVExperienceSchema: SchemaUnion = {
    type: Type.OBJECT,
    description: "Information regarding the work experience background of the person",
    properties: {
        items: {
            type: Type.ARRAY,
            description: "List of job experiences of a person.",
            items: ExperienceBaseProperties
        }
    },
    required: [""],
};
CVExperienceSchema.required = Object.keys(CVExperienceSchema.properties as unknown as object)