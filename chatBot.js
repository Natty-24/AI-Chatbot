const chatMain = document.querySelector(".chatbot-main");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const flieUpload = document.querySelector("#file-upload");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");


const API_KEY = "AIzaSyDNXTF0Y3Sd9do_rST4rrdUPkkMNWgWXV0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null
  }
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// CREATE MESSAGE ELEMENT WITH DYNAMIC CLASSES AND RETURN IT

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
 
// GENERATE BOT RESPONSE USING API

const generateBotResponse = async (incomingMessageDiv) => {
  
 const messageElement = incomingMessageDiv.querySelector(".message-text");

 // ADD USER MESSAGE TO CHAT HISTORY
  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message}, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
  });
                    //API REQUEST OPTIONS
   const requestOptions = {
    method: "POST",
    headers:{ "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory
    })
  }
  
  try{
    // FETCH BOT RESPONSE FROM API
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message);
   
     // EXTRACT AND DISPLAY BOT RESPONSE TEXT

      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      
       messageElement.innerText = apiResponseText;

    // ADD BOT RESPONSE TO CHAT HISTORY
       chatHistory.push({
        role: "model",
        parts: [{ text: userData.message}]
      });
   } catch (error) {
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = "#ff0000";
   } finally {
    // RESET USER FILE DATA, REMOVING THINKING INDICATOR AND SCROLL CHAT TO BOTTOM
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatMain.scrollTo({ top: chatMain.scrollHeight, behavior: "smooth" });
   }
}

//HANDLE OUTGOING USER MESSAGE

const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  messageInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
  messageInput.dispatchEvent(new Event("input"));
  
  // CREATE AND DIPLAY USER MESSAGE
  const messageContent = `<div class="message-text"></div> 
  ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}
  `; 
  chatMain.scrollTo({ top: chatMain.scrollHeight, behavior: "smooth" });

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
  chatMain.appendChild(outgoingMessageDiv);
  
  
  // SIMULATE BOT RESPONSE WITH THINKING INDICATOR AFTER A DELAY
  setTimeout(() => {
    const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#5f6368"><path d="M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z"/></svg>
        <div class="message-text">

          <div class="thinking-indicator">
          
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>`;
    
    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatMain.scrollTo({ top: chatMain.scrollHeight, behavior: "smooth" });
    chatMain.appendChild(incomingMessageDiv);
    generateBotResponse(incomingMessageDiv);
  }, 600);
} 
// HANDLE ENTER KEY PRESS FOR SENDING MESSAGE 
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if(e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768){
    handleOutgoingMessage(e);
  }
});
// ADJUST INPUT FIELD HEIGHT DYNAMICALLY 
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chatbot-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";

});
// HANDLE FILE INPUT CHANGE

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if(!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // STORE FILE DATA IN USERDATA

    userData.file = {
      data: base64String,
      mime_type: file.type
    }

    fileInput.value = "";
  }

    reader.readAsDataURL(file);
  });
  
  // CANCEL FILE UPLOAD

  fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");

  })

  
  const picker = new EmojiMart.Picker({
    skinTonePosition: "none",
    theme: "light",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
      const { selectionStart: start, selectionEnd: end } = messageInput;
      messageInput.setRangeText(emoji.native, start, end, "end");
      messageInput.focus();
    },
    onClickOutside: (e)	=> {
    if(e.target.id === "emoji-picker"){
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
    }
    });

    document.querySelector(".chatbot-form").appendChild(picker);
    
    sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
    document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    
    closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
