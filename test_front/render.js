const api_name_elem = document.getElementById("api_name");
const payload_elem = document.getElementById("payload");
const button_elem = document.getElementById("submit_button");
const response_elem = document.getElementById("response");
const api_list_elem = document.getElementById("api_list");

window.onload = () => {
    const lastAPI = localStorage.getItem("api_name");
    const lastPayloadData = localStorage.getItem("payload");
    if (lastAPI) {
        api_name_elem.value = lastAPI;
    }
    if (lastPayloadData) {
        payload_elem.value = lastPayloadData;
    }
};

api_name_elem.onchange = () => {
    localStorage.setItem("api_name", api_name_elem.value);
};

payload_elem.onchange = () => {
    localStorage.setItem("payload", payload_elem.value);
};

button_elem.onclick = async () => {
    let api = api_name_elem.value;
    let data = JSON.parse(payload_elem.value);
    let response = await window.bustub.sendMessage(api, data);
    
    response_elem.value = JSON.stringify(response, null, 4);
    
};

api_list_elem.onclick = (e) => {
    api_name_elem.value = e.target.innerText;
    e.stopPropagation();
};