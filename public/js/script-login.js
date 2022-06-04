document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();

    document.getElementById('form').addEventListener('submit', login);
});

function login(e) {
    e.preventDefault();

    // ⚠️ accessing elements and not their input value! (use .value to access input value)
    let email = document.getElementById('email');
    let password = document.getElementById('password');

    axios.post('http://localhost:3000/expense-tracker/login', {
        email: email.value,
        password: password.value
    })
    .then(result => {
        if(result.data.login == 'logged in successfully') {
            alert(result.data.login);

            const token = result.data.token;
            localStorage.setItem('token', token);
        }
    })
    .catch(err => {
        console.error(err);

        if(err.message == 'Request failed with status code 404') {
            email.classList.add('error');
            let divTemp = document.createElement('div');
            divTemp.innerText = "* E-Mail is incorrect!";
            divTemp.id = "error-email";
            insertAfter(divTemp, email);

            // removing a previously highlighted error Red Box for better usability
            if(document.getElementById('error-password')) {
                document.getElementById('error-password').remove();
                password.classList.remove('error');
            }
        }
        else if(err.message == 'Request failed with status code 401') {
            password.classList.add('error');
            let divTemp = document.createElement('div');
            divTemp.innerText = "* Password is incorrect!";
            divTemp.id = "error-password";
            insertAfter(divTemp, password);

            // removing a previously highlighted error Red Box for better usability
            if(document.getElementById('error-email')) {
                document.getElementById('error-email').remove();
                email.classList.remove('error');
            }
        }
        else if(err.message == 'Request failed with status code 500') {
            alert('Error! Please refresh the page and try again.');
        }
    });
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}