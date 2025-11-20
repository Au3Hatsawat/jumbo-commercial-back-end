import app from "./configs/server";
import dotenv from "dotenv";
dotenv.config();

async function bootstrap() {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
