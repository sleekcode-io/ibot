fs = require("fs");
axios = require("axios");

let curSessionId = -1; // Set to 0 to indicate session is starting to prevent multiple start

const startSession = async () => {
    // Start the session
    let response = null;
    await axios.post(
        "http://localhost:5205/conversation/v1/start",
        {
          roleid: 0,
        }
    ).then ((response) => {
      	curSessionId = response.data.conversationId;
      	console.log("Session: %d, role: %s.", response.data.conversationId, response.data.message);
    }).catch ((error) => {
      console.error("startSession error: " + error);
    })
}


const translate = async () => {
  console.log("translate starts ...");
  let total = 0;
  let success = 0;
  let fail = 0;

  let langArray = JSON.parse(fs.readFileSync("./isoLanguages.json", "utf-8"));

  if (curSessionId >= 0) {
    for (const i in langArray) {
      let lang = langArray[i];
      console.log(i + ":" + lang.code + ":" + lang.name);
    
      total++;

      if (lang.greeting === "") {
        let greeting = ": Hello, Welcome to aiBot. We speak " + lang.name;
        let message = "Translate to this sentence language " + lang.code + greeting;

        await axios.post("http://localhost:5205/conversation/v1/message", 
      			{ id: curSessionId, content: message }
	).then ((result) => {
          if (!result.data.response.includes("sorry"))
    	    lang.greeting = result.data.response;
          console.log(result.data.response);
	  success++;
   	}).catch ((error) => {
          console.error("translate error: " + error);
	  fail++;
        })
      }
      if (fail > 2)
	break;
    }
  }
  let jsonData = JSON.stringify(langArray, null, 2);
  fs.writeFileSync('./isoLanguages.json', jsonData, 'utf8');

  console.log("Stats: total: %d, success:%d, fail:%d", total, success, fail);
}

startSession();
setTimeout(() => {
    console.log("Got session: %d", curSessionId);
    translate();
}, 3000);



