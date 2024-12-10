require("dotenv").config();
const cors = require("cors")
const morgan=require("morgan")
const express=require("express");
const cookieParser = require("cookie-parser");
const { connection } = require("./db");
const { userRouter } = require("./routes/userRoutes");
const { productRouter } = require("./routes/productRoutes");
const { paymentRouter } = require("./routes/paymentRoutes");
const { passport } = require("./googleOauth");
const PORT=process.env.PORT
const app=express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins= ["http://localhost:5173","https://fiverr-backend-pied.vercel.app","https://fiverr-clone-murtaza.netlify.app"]
app.use(cors({
    origin:(origin,callback)=>{
        console.log("Origin is", origin);
        if(allowedOrigins.indexOf(origin)!==-1||!origin){
            console.log("Origin allowed");
            callback(null,true)
        }
        else{
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials:true
}));
app.use(morgan("dev"))



app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/payment", paymentRouter);

//Google Oauth start here

app.get("/google",passport.authenticate("google", { access_type: "offline", prompt: "consent", scope: ["email", "profile"] })
  );
  
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/google/failure",
    }),
    (req, res) => {
      try {
        if (req.user) {
          const accessToken = req.user.accessToken;
          const refreshToken = req.user.refreshToken;

          console.log("Google Access Token:", accessToken);
          console.log("Google Refresh Token:", refreshToken);
  
          // Set the token in an HTTP-only cookie
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
          });
          return res.redirect(
            `https://fiverr-clone-murtaza.netlify.app?token=${accessToken}&name=${req.user.userName}&email=${req.user.email}`
          );
        } else {
          return res.redirect("/google/failure");
        }
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
  
  app.get("/google/success", (req, res) => {
    redirect("https://fiverr-clone-murtaza.netlify.app")
    res.send("google o auth success");
  });
  app.get("/google/failure", (req, res) => {
    res.send("google o auth failed");
  });

  app.post('/logout', (req, res) => {
    try {
      // Manually clear cookies if required
      res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
  
      // Redirect to the frontend after logout
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      console.error("Error during logout:", err);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  });
  
  //Google Oauth ends here

app.use((req,res)=>{
    res.status(404).send("this is invalid request!")
});
app.listen(PORT, async(req,res)=>{
    try {
        await connection
        console.log(`server is running onn this port=>${PORT}, db is also connected`);
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})