import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// -> Generate token using JWT
const generateToken = (userId: number): string => {
  const secretKey = process.env.JWT_SECRET_KEY as string;
  const token = jwt.sign({ userId }, secretKey, { expiresIn: "1h" });
  return token;
};

// -> Verify Token
const verifyToken = (token : string) : {userId : number} | null =>{
    try{
        return jwt.verify(token,process.env.JWT_SECRET_KEY as  string) as {userId : number}

    }catch(err) {
        console.error("JWT verification failed",err);
        return null
    }
  }
export {
    generateToken,
    verifyToken
}