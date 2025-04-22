import {type Schema, type SchemaUnion, Type} from "@google/genai";

const EducationProperties: SchemaUnion = {
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
        degree: {
            type: Type.STRING,
            description: "Primary / High-School / GCSE / Abitur / Vocational Degree / Bachelor / Master's",
            nullable: true
        },
        institution: {
            type: Type.STRING,
            description: "Name of the school / university",
            nullable: true
        },
        city: {
            type: Type.STRING,
            description: "City this degree was obtained in",
            nullable: true
        },
        country: {
            type: Type.STRING,
            description: "Country this degree was obtained in as plain text (E.g. Germany, United States, etc)",
            nullable: true
        }
    }
}

EducationProperties.required = Object.keys(EducationProperties.properties as unknown as object)

export const CVEducationSchema: SchemaUnion = {
    type: Type.OBJECT,
    description: "Information regarding the educational background of the person",
    properties: {
        items: {
            type: Type.ARRAY,
            description: "List of educational degrees of a person.",
            items: EducationProperties
        }
    },
    required: [""],
};
CVEducationSchema.required = Object.keys(CVEducationSchema.properties as unknown as object)
