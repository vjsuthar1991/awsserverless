import { Client } from "pg";

export const DBClient = () => {
  return new Client({
    host: "ec2-18-212-186-174.compute-1.amazonaws.com",
    user: "user_service",
    database: "user_service",
    password: "user_service#2024",
    port: 5432,
    ssl: {
      "rejectUnauthorized": false
    }
  });
};

// host: "user-service.cheeu4y2w6zn.us-east-1.rds.amazonaws.com",
//     user: "user_service",
//     database: "user_service",
//     password: "user_service1991",
//     port: 5432,
//     ssl: {
//       "rejectUnauthorized": false
//     }