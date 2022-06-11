document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();

    document.getElementById('form').addEventListener('submit', login);

    getUserInfo();
});

function deleteMyExpense(e) {
    e.preventDefault();

    let id = e.target.id;
    let token = localStorage.getItem('token');

    axios.post('http://localhost:3000/expense-tracker/my-expense/delete', {
        'id': id
    },
    {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then((result) => {
        if(result.data.delete == 'successful') {
            alert(`Deleted successfully!`);
            location.reload();
        }
        else {
            alert(`Error! Please refresh the page and try again!`);
        }
    })
    .catch(err => {
        alert(`Error! Please refresh the page and try again!`);
    });
}

function getUserInfo_II() {
    return new Promise((resolve, reject) => {
        let token = localStorage.getItem('token');

        // checking if token exists; then validating the token if it complies with the secret key in the backend
        if(token !== null) {
            axios.get(`http://localhost:3000/expense-tracker/my-expense`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(result => {
                let user_data = result.data.user_data;
                resolve(user_data);
            })
            .catch(err => {
                reject(err);
            });
        }
        else {
            /* showing the login details */
            document.getElementsByClassName('left-section')[0].classList.remove('active');
            document.getElementsByClassName('right-section')[0].classList.remove('active');
            reject('Please login again!');
        }
    });
}

function getUserInfo() {
    let token = localStorage.getItem('token');

    // checking if token exists; then validating the token if it complies with the secret key in the backend
    if(token !== null) {
        axios.get(`http://localhost:3000/expense-tracker/track-expense`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(result => {
            const username = result.data.username;
            dailyExpense(username);
        })
        .catch(err => {
            console.log(err);

            /* showing the login details */
            document.getElementsByClassName('left-section')[0].classList.remove('active');
            document.getElementsByClassName('right-section')[0].classList.remove('active');
        });
    }
    else {
        /* showing the login details */
        document.getElementsByClassName('left-section')[0].classList.remove('active');
        document.getElementsByClassName('right-section')[0].classList.remove('active');
    }
}

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

function myExpenses(e) {
    e.preventDefault();

    document.getElementById('newDiv').classList.add('active');

    let newDiv2 = document.createElement('div');
    document.getElementsByClassName('container')[0].appendChild(newDiv2);
    newDiv2.id = 'newDiv2';

    // table
    let table = document.createElement('table');
    newDiv2.appendChild(table);
    table.className = 'expense-table';
        // thead
        let thead = document.createElement('thead');
        table.appendChild(thead);
            // tr for 'thead'
            let tr_thead = document.createElement('tr');
            thead.appendChild(tr_thead);
                // td for 'tr_thead'
                let td_tr_thead_1 = document.createElement('td');
                tr_thead.appendChild(td_tr_thead_1);
                td_tr_thead_1.innerText = 'S.No.';

                let td_tr_thead_2 = document.createElement('td');
                tr_thead.appendChild(td_tr_thead_2);
                td_tr_thead_2.innerText = 'Category';

                let td_tr_thead_3 = document.createElement('td');
                tr_thead.appendChild(td_tr_thead_3);
                td_tr_thead_3.innerText = 'Expense Amount (₹)';

                let td_tr_thead_4 = document.createElement('td');
                tr_thead.appendChild(td_tr_thead_4);
                td_tr_thead_4.innerText = 'Description';

                let td_tr_thead_5 = document.createElement('td');
                tr_thead.appendChild(td_tr_thead_5);
                td_tr_thead_5.innerText = 'Option';
                
        // tbody
        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        getUserInfo_II()
        .then(user_data => {
            for(let i=0; i<user_data.length; i++) {
                console.log(user_data[i]);
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                
                // S.No.
                let td_1 = document.createElement('td');
                tr.appendChild(td_1);
                td_1.innerText = i+1;

                // Category
                let td_2 = document.createElement('td');
                tr.appendChild(td_2);
                td_2.innerText = user_data[i].category;

                // Expense Amount (₹)
                let td_3 = document.createElement('td');
                tr.appendChild(td_3);
                td_3.innerText = user_data[i].amount;

                // Description
                let td_4 = document.createElement('td');
                tr.appendChild(td_4);
                td_4.innerText = user_data[i].description;

                // Options
                let td_5 = document.createElement('td');
                tr.appendChild(td_5);
                    // a
                    let a1 = document.createElement('a');
                    td_5.appendChild(a1);
                    a1.innerText = 'delete';
                    a1.id = user_data[i].id;
                    a1.addEventListener('click', deleteMyExpense);
            }
        })
        .catch(err => console.error(err));

    // link
    let addNewExpense = document.createElement('a');
    newDiv2.appendChild(addNewExpense);
    addNewExpense.id = 'addNewExpense';
    addNewExpense.innerText = '← Track A New Expense';
    addNewExpense.onclick = () => {
        // delete 'newDiv2' and go back to showing add new expense form
        document.getElementById('newDiv2').remove();
        document.getElementById('newDiv').classList.remove('active');
    };
}

function track(e) {
    e.preventDefault();

    let token = localStorage.getItem('token');

    // ⚠️ accessing elements and not their input value! (use .value to access input value)
    let category = document.getElementById('category');
    let expense = document.getElementById('expense');
    let description = document.getElementById('description');

    axios.post('http://localhost:3000/expense-tracker/track-expense', {
        'track': {
            'category': category.value,
            'expense': expense.value,
            'description': description.value
        }
    },
    {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(result => {
        if(result.data.dailyExpense == 'created successfully') {
            alert('Added successfully');

            // emtying out the input fields for a new input!
            expense.value = "";
            description.value = "";
        }
        else {
            alert('Error! Please refresh the page and try again');
        }
    })
    .catch(err => {
        alert('Error! Please refresh the page and try again');
        console.log(err);
    });
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
                option0.value = 'Other';
                option0.innerText = '🛸 Other';
                select.appendChild(option0);

                let option1 = document.createElement('option');
                option1.value = 'Clothes';
                option1.innerText = '👕 Clothes';
                select.appendChild(option1);

                let option2 = document.createElement('option');
                option2.value = 'Education';
                option2.innerText = '🎓 Education';
                select.appendChild(option2);

                let option3 = document.createElement('option');
                option3.value = 'Electricity';
                option3.innerText = '⚡️ Electricity';
                select.appendChild(option3);

                let option4 = document.createElement('option');
                option4.value = 'Food';
                option4.innerText = '🌯 Food';
                select.appendChild(option4);

                let option5 = document.createElement('option');
                option5.value = 'Fuel';
                option5.innerText = '⛽️ Fuel';
                select.appendChild(option5);
            
                let option6= document.createElement('option');
                option6.value = 'Grocery';
                option6.innerText = '🛒 Grocery';
                select.appendChild(option6);

                let option7 = document.createElement('option');
                option7.value = 'Health';
                option7.innerText = '⛑ Health';
                select.appendChild(option7);

                let option8 = document.createElement('option');
                option8.value = 'Milk';
                option8.innerText = '🥛 Milk';
                select.appendChild(option8);

                let option9 = document.createElement('option');
                option9.value = 'Shopping';
                option9.innerText = '🛍 Shopping';
                select.appendChild(option9);

                let option10 = document.createElement('option');
                option10.value = 'Travel';
                option10.innerText = '✈️ Travel';
                select.appendChild(option10);

                let option11 = document.createElement('option');
                option11.value = 'Water';
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
            input1.setAttribute('required', '');
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
        let trackBtn = document.createElement('input');
        trackBtn.type = 'submit';
        trackBtn.name = 'track';
        trackBtn.id = 'track';
        trackBtn.value = 'Track';
        form.appendChild(trackBtn);

    // View All My Expenses
    let myExpensesBtn = document.createElement('a');
    newDiv.appendChild(myExpensesBtn);
    myExpensesBtn.id = 'myExpenses';
    myExpensesBtn.innerText = 'View All My Expenses →';
    myExpensesBtn.onclick = myExpenses;
    
    // FINALLY => appending the 'container' in to the 'body'
    document.getElementsByTagName('body')[0].appendChild(container);
    document.getElementById('daily-expense-form').addEventListener('submit', track);
}