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
            // alert(result.data.login);

            const username = result.data.username;

            const token = result.data.token;
            localStorage.setItem('token', token);

            // after successfully logging in
            dailyExpense(username);
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

function dailyExpense(username) {
    /* hiding the login details */
    document.getElementsByClassName('left-section')[0].classList.add('active');
    document.getElementsByClassName('right-section')[0].classList.add('active');

    document.getElementsByTagName('title')[0].innerText = 'Daily Expense | Expense Tracker';

    /* inserting new HTML elements for the Daily Expense feature */
    
    // background
    let container = document.createElement('div');
    container.classList.add('container');

    // img bar
    let imgBar = document.createElement('img');
    imgBar.src = "https://img.freepik.com/free-vector/seamless-pattern-with-exotic-tropical-plants-modern-style_1458-980.jpg?w=2000";
    imgBar.classList.add('imgBar');
    container.appendChild(imgBar); // child #1

    // logo
    let h3 = document.createElement('h3');
    h3.innerText = '📝';
    h3.classList.add('logo');
    container.appendChild(h3);

    // h1
    let h1 = document.createElement('h1');
    h1.innerText = 'Daily Expense';
    h1.classList.add('dailyExpense');
    container.appendChild(h1);

    // Hi
    let h2 = document.createElement('h2');
    h2.innerText = `Hi ${username}!`;
    h2.classList.add('Hi');
    container.appendChild(h2);

    //'div' for 'form'
    let newDiv = document.createElement('div');
    newDiv.id = 'newDiv';

    // form
    let form = document.createElement('form');
    form.id = 'daily-expense-form';
    newDiv.appendChild(form);
    container.appendChild(newDiv);
        // label #1
        let category = document.createElement('label');
        category.htmlFor = 'category';
        category.innerText = 'Select a category ';
        form.appendChild(category);
            // 'span' for 'select'
            let spanSelect = document.createElement('span');
            spanSelect.id = 'spanSelect';
            // select
            let select = document.createElement('select');
            select.name = 'category';
            select.id = 'category';
            spanSelect.appendChild(select);
            form.appendChild(spanSelect);
                //option
                let option0 = document.createElement('option');
                option0.value = 'other';
                option0.innerText = '🛸 Other';
                select.appendChild(option0);

                let option1 = document.createElement('option');
                option1.value = 'clothes';
                option1.innerText = '👕 Clothes';
                select.appendChild(option1);

                let option2 = document.createElement('option');
                option2.value = 'education';
                option2.innerText = '🎓 Education';
                select.appendChild(option2);

                let option3 = document.createElement('option');
                option3.value = 'electricity';
                option3.innerText = '⚡️ Electricity';
                select.appendChild(option3);

                let option4 = document.createElement('option');
                option4.value = 'food';
                option4.innerText = '🌯 Food';
                select.appendChild(option4);

                let option5 = document.createElement('option');
                option5.value = 'fuel';
                option5.innerText = '⛽️ Fuel';
                select.appendChild(option5);
            
                let option6= document.createElement('option');
                option6.value = 'grocery';
                option6.innerText = '🛒 Grocery';
                select.appendChild(option6);

                let option7 = document.createElement('option');
                option7.value = 'health';
                option7.innerText = '⛑ Health';
                select.appendChild(option7);

                let option8 = document.createElement('option');
                option8.value = 'milk';
                option8.innerText = '🥛 Milk';
                select.appendChild(option8);

                let option9 = document.createElement('option');
                option9.value = 'shopping';
                option9.innerText = '🛍 Shopping';
                select.appendChild(option9);

                let option10 = document.createElement('option');
                option10.value = 'travel';
                option10.innerText = '✈️ Travel';
                select.appendChild(option10);

                let option11 = document.createElement('option');
                option11.value = 'water';
                option11.innerText = '💧 Water';
                select.appendChild(option11);

        form.appendChild(document.createElement('br'));
        form.appendChild(document.createElement('br'));

        // label #2
        let expense = document.createElement('label');
        expense.htmlFor = 'expense';
        expense.innerText = 'Add expense amount (₹) ';
        form.appendChild(expense);
            // input
            let input1 = document.createElement('input');
            input1.type = 'number';
            input1.name = 'expense';
            input1.id = 'expense';
            input1.min = 0;
            form.appendChild(input1);
        
        form.appendChild(document.createElement('br'));
        form.appendChild(document.createElement('br'));
        
        // label #3
        let description = document.createElement('label');
        description.htmlFor = 'description';
        description.innerText = 'Write a description ';
        form.appendChild(description);
        form.appendChild(document.createElement('br'));
            // textarea
            let textarea = document.createElement('textarea');
            textarea.name = 'description';
            textarea.id = 'description';
            form.appendChild(textarea);

        form.appendChild(document.createElement('br'));
        form.appendChild(document.createElement('br'));

        // submit
        let submit = document.createElement('input');
        submit.type = 'submit';
        submit.name = 'submit';
        submit.id = 'submit';
        form.appendChild(submit);

    // FINALLY => appending the 'container' in to the 'body'
    document.getElementsByTagName('body')[0].appendChild(container);
}