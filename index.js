const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const compiler = require("compilex");
const path = require("path");

const app = express();
const options = { stats: true };
compiler.init(options);

app.use(cors());
app.use(bodyParser.json());

// Serve static files dynamically using path module
app.use(
  "/codemirror-5.65.16",
  express.static(path.resolve(__dirname, "codemirror-5.65.16"))
);

// Serve the main HTML file dynamically
app.get("/", function (req, res) {
  compiler.flush(function () {
    // Callback logic if needed
  });
  res.sendFile(path.resolve(__dirname, "index.html"));
});

app.post("/compile", function (req, res) {
  const { code, input, lang } = req.body;
  let envData;

  try {
    switch (lang) {
      case "C++":
        envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
        if (!input) {
          compiler.compileCPP(envData, code, sendResponse);
        } else {
          compiler.compileCPPWithInput(envData, code, input, sendResponse);
        }
        break;
      case "Java":
        envData = { OS: "windows" };
        if (!input) {
          compiler.compileJava(envData, code, sendResponse);
        } else {
          compiler.compileJavaWithInput(envData, code, input, sendResponse);
        }
        break;
      case "Python":
        envData = { OS: "windows" };
        if (!input) {
          compiler.compilePython(envData, code, sendResponse);
        } else {
          compiler.compilePythonWithInput(envData, code, input, sendResponse);
        }
        break;
      default:
        res.status(400).send({ output: "Unsupported language" });
    }

    function sendResponse(data) {
      if (data.error) {
        res.status(500).send(data);
      } else {
        res.send(data);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ output: "An error occurred during compilation" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
