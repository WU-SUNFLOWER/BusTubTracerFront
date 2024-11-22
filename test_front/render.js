const button = document.getElementById("submit_button");
const response_elem = document.getElementById("response");
const text_input = document.getElementById("text_input");
const err_elem = document.getElementById("err_msg");

button.onclick = async () => {
    let data = {
        "sql": text_input.value,
    };
    let response = await window.bustub.sendMessage('/submit_sql_command', data);
    if (response.err_msg) {
        err_elem.innerText = response.err_msg;
    } else {
        response_elem.innerText = response.data.raw_result;
    }
    
};