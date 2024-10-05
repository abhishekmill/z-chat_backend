import jwt from "jsonwebtoken";

const isAunthicated = async (req, res, next) => {
  try {
    const token = await req.cookies.token;
    if (!token) {
      res.status(401).send("invalid token");
    }
    const decode = await jwt.verify(token, process.env.SECRETE_KEY);

    if (!decode) {
      res.status(401).send("invalid token verification");
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};

export default isAunthicated;
