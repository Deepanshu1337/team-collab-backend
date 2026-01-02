import path from "path";
import { fileURLToPath } from "url";

const _fileName = fileURLToPath(import.meta.url);
const _dirName = path.dirname(_fileName);

export {_fileName, _dirName};