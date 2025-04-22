import path from "node:path";
import fs from "fs";

export function loadTextFile(filePath: string) {
    const resolvedPath = path.resolve(__dirname, filePath);
    return fs.readFileSync(resolvedPath).toString()
}