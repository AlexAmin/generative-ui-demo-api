import crypto from "crypto"

export const uuidv4 = () => crypto.randomBytes(16).toString("hex");
