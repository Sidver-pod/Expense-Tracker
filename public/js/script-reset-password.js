let form = document.getElementsByTagName('form')[0];
let password1 = document.getElementsByTagName('input')[0];
let password2 = document.getElementsByTagName('input')[1];

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if(password1.value !== password2.value) {
        password1.style.borderColor = '#F35D5D';
        password2.style.borderColor = '#F35D5D';
        
        let div_one = document.getElementsByClassName('one')[0];

        if(!document.getElementsByTagName('p')[0]) {
            let p = document.createElement('p');
            div_one.appendChild(p);
            p.innerText = '* Passwords do not match!';
            p.style.color = '#F35D5D';
            p.style.marginTop = '-65px';
            p.style.fontSize = 'small';
        }
    }
    else {
        let url = window.location.href;
        let uuid = url.slice(38); // specific to the URL route in use; could result in an error if route is changed!

        axios.post(`https://localhost:3000/password/update/${uuid}`, {
            'password': password1.value
        })
        .then(result => {
            password1.value = '';
            password2.value = '';
            alert(result.data.password);
        })
        .catch(err => {
            alert('Error! Please try again by generating a new reset link by heading back to the login page and clicking on Forgot Password?');

            console.error(err);
        });
    }
});

password1.addEventListener('click', (e) => {
    e.preventDefault();

    if(e.target.style.borderColor === 'rgb(243, 93, 93)') {
        e.target.style.borderColor = 'white';
        e.target.nextElementSibling.style.borderColor = 'white';
        e.target.parentElement.nextElementSibling.remove();
    }
});

password2.addEventListener('click', (e) => {
    e.preventDefault();

    if(e.target.style.borderColor === 'rgb(243, 93, 93)') {
        e.target.style.borderColor = 'white';
        e.target.previousElementSibling.style.borderColor = 'white';
        e.target.parentElement.nextElementSibling.remove();
    }
});