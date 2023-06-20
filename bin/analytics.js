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
exports.track = void 0;
const node_machine_id_1 = require("node-machine-id");
const rudder_sdk_node_1 = __importDefault(require("@rudderstack/rudder-sdk-node"));
let client;
try {
    client = new rudder_sdk_node_1.default(process.env.RUDDER_STACK_KEY, {
        dataPlaneUrl: process.env.RUDDER_STACK_DATAPLANE_URL,
    });
}
catch (e) {
}
const track = (event, properties) => __awaiter(void 0, void 0, void 0, function* () {
    if (!client || process.env.NO_TRACKING)
        return;
    client.track({
        userId: yield (0, node_machine_id_1.machineId)(),
        event,
        properties,
    });
});
exports.track = track;
