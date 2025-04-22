import {type SchemaUnion, Type} from "@google/genai";

export const CVPersonalInfoSchema: SchemaUnion = {
    type: Type.OBJECT,
    properties: {
        fullName: {
            type: Type.STRING,
            description: "Full name of the person as {firstName} {lastName}",
            nullable: true
        },
        email: {
            type: Type.STRING,
            description: "Person's email address",
            nullable: true
        },
        dateOfBirth: {
            type: Type.STRING,
            description: "Person's date of birth in ISO format",
            nullable: true
        },
        placeOfBirth: {
            type: Type.STRING,
            description: "Person's place of birth as {city english},{countryISO}",
            nullable: true
        },
        address: {
            type: Type.STRING,
            description: "Person's address in US format",
            nullable: true
        },
        phone: {
            type: Type.STRING,
            description: "Person's phone number. Derive country code from number or address.",
            nullable: true
        },
        website: {
            type: Type.STRING,
            description: "Person's personal website URL",
            nullable: true
        },
        linkedIn: {
            type: Type.STRING,
            description: "Person's linkedIn URL",
            nullable: true
        },
        maritalStatus: {
            type: Type.STRING,
            description: "Person's marital status",
            nullable: true
        },
    },
    required: [""]
}
CVPersonalInfoSchema.required = Object.keys(CVPersonalInfoSchema.properties as unknown as object)