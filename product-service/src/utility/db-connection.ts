import * as mongoose from 'mongoose';
mongoose.set("strictQuery", false);

export const ConnectDB = async () => {
    const DB_URL: string = "mongodb+srv://suthar67:QWabEK25SaW0ZQGG@cluster0.ndp3c.mongodb.net/nodejs-products";
    try {
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          } as mongoose.ConnectOptions);
        console.log("Successfully connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
};
