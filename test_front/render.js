const button = document.getElementById("submit_button");
const response_elem = document.getElementById("response");
const text_input = document.getElementById("text_input");

button.onclick = async () => {
    let data = {
        "sql": text_input.value,
    };
    console.log("before response");
    let response = await window.bustub.sendMessage('/submit_sql_command', data);
    console.log("after response");
    response_elem.innerText = response.data.raw_result;
};