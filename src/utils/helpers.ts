import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { MySceneContext } from "./sessionManager";
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
  
// Helper function to handle cancellation
const cancelOperation = async (ctx: MySceneContext, input: string, replyMsg : string) => {
  if (input.toLowerCase() === "cancel") {
    await ctx.reply(replyMsg);
    return ctx.scene.leave();
  }
};
export {
    generateToken,
    verifyToken,
    cancelOperation
}