"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const eventSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    is_reg: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
    },
    poster: {
        type: String,
    },
    docs: {
        type: Array,
    },
    date: {
        type: Date,
        required: true,
    },
    minpart: {
        type: Number,
        required: true,
    },
    maxpart: {
        type: Number,
        required: true,
    },
    closed: {
        type: Boolean,
        default: false,
    },
    is_team: {
        type: Boolean,
        default: false,
    },
    participants: [{ type: mongoose_1.Types.ObjectId, ref: "EventRegs" }],
    teams: {
        type: [mongoose_1.Types.ObjectId],
        ref: "Teams",
    },
}, { timestamps: true });
exports.Event = mongoose_1.default.model("Events", eventSchema);
