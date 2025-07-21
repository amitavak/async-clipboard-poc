/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

console.log("AsyncClipboardAPI | App is loaded.");

// Get references to the DOM elements with id "copy-btn"
const copyBtn = document.getElementById("copy-btn");

// Get references to the DOM elements with id "paste-btn"
const pasteBtn = document.getElementById("paste-btn");

// Get references to the DOM elements with id "paste-data"
const logOutputElm = document.getElementById("log-output");

// Get references to the DOM elements with id "clear-btn"
const clearBtn = document.getElementById("clear-btn");

// Get references to the DOM elements with id "clear-btn"
const clipboardTextPayloadElm = document.getElementById(
  "clipboard-text-payload"
);

// Get references to the DOM elements with id "clear-btn"
const clipboardHtmlPayloadElm = document.getElementById(
  "clipboard-html-payload"
);

let copyTextPayload = ""; //"1".repeat(10 * 1024 * 1024);
let copyHtmlPayload = "";

// Read a text file from the server
fetch("copy-txt-payload.txt").then((response) => {
  response.text().then((text) => {
    logMessage("Copy text payload loaded!");
    copyTextPayload = text;
  });
});

fetch("copy-html-payload.txt").then((response) => {
  response.text().then((text) => {
    logMessage("Copy html payload loaded!");
    copyHtmlPayload = text;
  });
});

function checkClipboardPermission() {
  if (navigator?.permissions?.query) {
    navigator.permissions
      .query({ name: "clipboard-read" })
      .then((permissionStatus) => {
        logMessage(`Clipboard permission state: ${permissionStatus?.state}`);
      })
      .catch((err) => {
        logMessage(
          `Failed to query the clipboard permission state. Error: ${JSON.stringify(
            err
          )}`
        );
      });
  } else {
    logMessage(`Browser does not support 'navigator.permissions.query'`);
  }
}

document.addEventListener("copy", function (e) {
  console.log("AsyncClipboardAPI | Copy event detected!");
  const t0 = performance.now();
  e.clipboardData.setData("text/plain", copyTextPayload); //
  e.clipboardData.setData("text/html", copyHtmlPayload); //copyHtmlPayload
  const t1 = performance.now();
  logMessage(`Copy successfull. Time: ${t1 - t0} ms`);
  e.preventDefault();
});

document.addEventListener("paste", function (e) {
  console.log("AsyncClipboardAPI | Paste event detected!");
  //const t0 = performance.now();
  //const clipboardTextData = e.clipboardData.getData("text/plain");
  //const clipboardHtmlData = e.clipboardData.getData("text/html");
  //const t1 = performance.now();
  //logMessage(`Paste successfull. Time: ${t1 - t0} ms`);
  //clipboardTextPayloadElm.innerText = clipboardTextData;
  //clipboardHtmlPayloadElm.innerText = clipboardHtmlData;
  pasteFromClipboard();
  e.preventDefault();
});

// Add event listeners to copyBtn
copyBtn.addEventListener("click", copyToClipboard);

// Add event listeners to pasteBtn
pasteBtn.addEventListener("click", pasteFromClipboard);

// Add event listeners to clearBtn
clearBtn.addEventListener("click", clearClipboard);

function clearClipboard() {
  logMessage("Clearing clipboard!");
  logOutputElm.value = "";
  clipboardTextPayloadElm.innerText = "No text content pasted";
  clipboardHtmlPayloadElm.innerText = "No html content pasted";
  navigator.clipboard
    .writeText("")
    .then(() => {
      logMessage("Clipboard cleared!");
    })
    .catch((err) => {
      logMessage("Failed to clear clipboard!");
    });
}

function copyToClipboard() {
  console.log("AsyncClipboardAPI | Copying to clipboard!");

  if (!navigator.clipboard) {
    logMessage("Async Clipboard API not available!");
    return;
  }

  const t0 = performance.now();

  navigator.clipboard
    .write([
      new ClipboardItem({
        "text/plain": new Blob([copyTextPayload], { type: "text/plain" }), //copyTextPayload
        "text/html": new Blob([copyHtmlPayload], { type: "text/html" }), //copyHtmlPayload
      }),
    ])
    .then(() => {
      const t1 = performance.now();
      logMessage(`Async Copy successfull. Time: ${t1 - t0} ms`);
    })
    .catch((err) => {
      logMessage("Failed to copy to clipboard!");
    });
}

function pasteFromClipboard() {
  console.log("AsyncClipboardAPI | Pasting from clipboard!");

  if (!navigator.clipboard) {
    logMessage("Async Clipboard API not available!");
    return;
  }

  const t0 = performance.now();

  navigator.clipboard
    .read({ unsanitized: ["text/html"] })
    .then((clipboardItems) => {
      const t1 = performance.now();
      logMessage(`Read successfull from clipboard. Time: , ${t1 - t0}ms`);

      let clipboardDataPromises = [];

      for (const clipboardItem of clipboardItems) {
        if (clipboardItem.types?.includes("text/plain")) {
          clipboardDataPromises.push(clipboardItem.getType("text/plain"));
        }
        if (clipboardItem.types?.includes("text/html")) {
          clipboardDataPromises.push(clipboardItem.getType("text/html"));
        }
      }

      return Promise.all(clipboardDataPromises).then((clipboardDataBlobs) => {
        return clipboardDataBlobs.map((x) => x.text());
      });
    })
    .then((clipboardDataPromises) => {
      Promise.all(clipboardDataPromises).then((clipboardData) => {
        const t2 = performance.now();
        logMessage(`Async paste successfull. Time: ${t2 - t0} ms`);
        clipboardTextPayloadElm.innerText = clipboardData[0];
        clipboardHtmlPayloadElm.innerText = clipboardData[1];
      });
    })
    .catch((err) => {
      logMessage("Failed to paste from clipboard!");
    });
}

function logMessage(message) {
  logOutputElm.value += `${message}\n---------\n`;
  logOutputElm.scrollTop = logOutputElm.scrollHeight;
}

checkClipboardPermission();
