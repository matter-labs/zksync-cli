"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZKSYNCDir = exports.checkAndCreateZkSyncDir = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const constants_1 = require("./constants");
// check if .zysync exists in ~ and create it if not
const checkAndCreateZkSyncDir = () => __awaiter(void 0, void 0, void 0, function* () {
    const zksyncDir = getZKSYNCDir();
    try {
        yield promises_1.default.access(zksyncDir);
    }
    catch (e) {
        yield promises_1.default.mkdir(zksyncDir);
    }
});
exports.checkAndCreateZkSyncDir = checkAndCreateZkSyncDir;
const getZKSYNCDir = () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return `${homeDir}/${constants_1.ZKSYNC_DIR}`;
};
exports.getZKSYNCDir = getZKSYNCDir;
