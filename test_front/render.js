const button = document.getElementById("submit_button");
const response_elem = document.getElementById("response");
const text_input = document.getElementById("text_input");

button.onclick = async () => {
    let data = {
        "text": text_input.value,
    };
    console.log("before response");
    let response = await window.bustub.sendMessage('/test_api', data);
    console.log("after response");
    response_elem.innerText = response.data.text;
};