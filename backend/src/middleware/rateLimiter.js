import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        // here we just keep it simple
        // in a real-world-app you might want to use the user's IP address or user ID
        // to limit the rate of requests
        const {success} = await ratelimit.limit("my-rate-limiter");  

        if(!success) {
            return res.status(429).json({
                message: "Too many requests, please try again later."
            });
        }

        next();
     
    } catch (error) {
        console.log("Rate limit error", error);
        next(error);
    }
};

export default rateLimiter;

// give me correct package version commands

//this "npm i @upstash/redis@1.34.9 @upstash/ratelimit@2.0.5" version is not supporting 

//iam getting this error
