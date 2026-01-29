import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "./models/common.tsp";
import "./models/account.tsp";
import "./models/task.tsp";
import "./routes/accounts.tsp";
import "./routes/tasks.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "TASK MANAGEMENT SYSTEM API",
})

@server("http://localhost:8080", "Development server")
namespace TaskManagement;
