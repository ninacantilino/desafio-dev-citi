import "dotenv/config";
import express, { ErrorRequestHandler } from "express";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(routes);

// Qualquer rota que não existe cai aqui
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
    res.status(400).json({ message: "JSON inválido. Verifique a sintaxe do corpo da requisição." });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
};

app.use(errorHandler);

const port = process.env.SERVER_PORT || 3001;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
