import { Client } from "pg";

export const DBClient = () => {
  const client = new Client({
    host: "ec2-54-165-132-173.compute-1.amazonaws.com",
    user: "transaction_service",
    database: "transaction_service",
    password: "transaction_service#2023",
    port: 5432,
  });
  console.log(client);
  return client;
};
