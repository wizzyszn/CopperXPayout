"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// -> Generate token using JWT
const generateToken = (userId) => {
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jsonwebtoken_1.default.sign({ userId }, secretKey, { expiresIn: "1h" });
    return token;
};
exports.generateToken = generateToken;
// -> Verify Token
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
    }
    catch (err) {
        console.error("JWT verification failed", err);
        return null;
    }
};
exports.verifyToken = verifyToken;
