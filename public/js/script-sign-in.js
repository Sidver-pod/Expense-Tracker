document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();

    // on clicking "Sign In" checks if the User has entered all the fields; if not then includes a RED border;
    document.getElementById('form').addEventListener('submit', signIn);
    document.getElementById('phoneNo').addEventListener('invalid', errPhoneNo);
});

function errPhoneNo(e) {
    e.preventDefault();

    let phoneNo = document.getElementById('phoneNo');

    // alerts the user with a RED bordered box!!
    if(isNaN(phoneNo.value) || phoneNo.value.length != 10) {
        phoneNo.classList.add("error");
        let divTemp = document.createElement('div');
        divTemp.innerText = "* Enter your 10-digit phone number";
        divTemp.id = "error-phoneNo";
        insertAfter(divTemp, phoneNo);
    }
}

function signIn(e) {
    e.preventDefault();
    
    // removing the divTemp ERROR pop up for 'phoneNo' if present
    if(document.getElementById('error-phoneNo')) document.getElementById('error-phoneNo').remove();

    // ⚠️ accessing elements and not their input value! (use .value to access input value)
    let username = document.getElementById('name');
    let phoneNo = document.getElementById('phoneNo');
    let email = document.getElementById('email');
    let password = document.getElementById('password');

    // if empty => alerts the user with a RED bordered box!!
    if(username.value === "") username.classList.add("error");
    else if(phoneNo.value === "") phoneNo.classList.add("error");
    else if(email.value === "") email.classList.add("error");
    else if(password.value === "") password.classList.add("error");
    else {
        axios.post('http://localhost:3000/expense-tracker/sign-in', {
            username: username.value,
            phoneNo: phoneNo.value,
            email: email.value,
            password: password.value
        })
        .then(result => {
            if(result.data.user == 'created successfully') {
                alert('Account created successfully!' );
                // removing the divTemp ERROR pop up for 'email' if present
                if(document.getElementById('error-email')) document.getElementById('error-email').remove();
            }
        })
        .catch(err => {
            if(err.message == 'Request failed with status code 403') {
                // if user already exists => alerts the user with a RED bordered box!!
                email.classList.add("error");
                let divTemp = document.createElement('div');
                divTemp.innerText = "* User already exists!";
                divTemp.id = "error-email";
                insertAfter(divTemp, email);
            }
            else alert(`Error! Please type in your credentials correctly and try again. If the problem persists refresh the page and try again!`);
        });
    }
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}