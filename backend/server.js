const express = require('express');
const connect = require('./config/dbConnect');
// const app = express();
const cookieParser = require('cookie-parser');

const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');



const multer = require("multer");
const axios = require("axios");
const path = require("path");





const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const postFeed = require('./routes/feedRoute');
const likeRoute = require('./routes/likeRoute');
const commentRoute = require('./routes/commentRoute');
const shareRoute = require('./routes/shareRoute');
const connection = require('./routes/connection');
const message = require('./routes/messageRoute');
const notificationRoute = require('./routes/notificationRoute');
const quizRoute = require('./routes/quizRoute')
const otpRoute = require('./routes/otpRoute');

const {app, server} = require('./Socket/socket');


const fs = require("fs");
const FormData = require("form-data");


require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin:"https://teachingpariksha.onrender.com/",
        credentials:true,
    })
)
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)


app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/feed', postFeed);
app.use('/api/v1/like', likeRoute);
app.use('/api/v1/comment', commentRoute);
app.use('/api/v1/share', shareRoute);
app.use('/api/v1/connect', connection)
app.use('/api/v1/messages', message);
app.use('/api/v1/notification', notificationRoute);
app.use("/api/v1/quiz", quizRoute);
app.use('/api/v1/otp', otpRoute);


// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });
// Route to send image to Python API
app.post("/detect", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const formData = new FormData();
        formData.append("image", fs.createReadStream(filePath));

        const response = await axios.post("http://127.0.0.1:5000/detect", formData, {
            headers: formData.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


server.listen(PORT, () => {
    console.log(`Server started at ${PORT} `);
});

// database connection
connect();
cloudinaryConnect();









