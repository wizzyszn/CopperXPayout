import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const generateToken = (userId: number): string => {
  const secretKey = process.env.JWT_SECRET_KEY as string;
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "1h" });
  return token;
};

export {
    generateToken
}