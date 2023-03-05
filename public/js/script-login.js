document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();

    document.getElementById('form').addEventListener('submit', login);
    document.getElementsByClassName('forgot-password')[0].addEventListener('click', forgotPassword);

    getUserInfo();
});

function checkPassword(emailAddress) {
    return new Promise((resolve, reject) => {
        axios.post('https://localhost:3000/password/forgot', {
            'emailAddress': emailAddress
        })
        .then(result => {
            resolve(result.data);
        })
        .catch(err => {
            reject(err);
        });
    });
}

function forgotPassword(e) {
    e.preventDefault();

    let body = document.getElementsByTagName('body')[0];
    
    // Popup Container
    let popupContainer = document.createElement('div');
    body.appendChild(popupContainer);
    popupContainer.className = 'popup-container';
    popupContainer.style.zIndex = '2';

    // Popup
    let popup = document.createElement('div');
    popupContainer.appendChild(popup);
    popup.className = 'popup-forgot-password';

    // Close
    let div0 = document.createElement('div');
    let close = document.createElement('button');
    div0.appendChild(close);
    popup.appendChild(div0);
    close.className = 'close-forgot-password';
    close.innerHTML = '&times;';
    close.onclick = (e) => {
        e.preventDefault();
        popupContainer.remove();
    };

    // h2
    let div1 = document.createElement('div');
    let h2 = document.createElement('h2');
    div1.appendChild(h2);
    popup.appendChild(div1);
    h2.innerText = 'Reset Your Password';

    // Form
    let div2 = document.createElement('div');
    let form = document.createElement('form');
    div2.appendChild(form);
    popup.appendChild(div2);
        // Email
        let email = document.createElement('input');
        form.appendChild(email);
        email.type = 'email';
        email.placeholder = 'E-Mail';
        email.required = true;
        // Reset
        let reset = document.createElement('input');
        form.appendChild(reset);
        reset.type = 'submit';
        reset.name = 'reset';
        reset.value = 'Reset';
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let emailAddress = e.target.firstElementChild.value;

        await checkPassword(emailAddress)
        .then(result => {
            alert(result.email);
        })
        .catch(err => {
            console.error(err);
            alert(`Error! Please refresh the page and try again.`);
        });
    });
}

function viewExpense(e) {
    e.preventDefault();

    let userId = e.target.id;
    let token = localStorage.getItem('token');

    // '-1' allows the backend logic to send the whole 'Daily Expense' for the user
    axios.post('https://localhost:3000/expense-tracker/my-expense', {
        currentPageNumber: -1
    },
    {
        headers: {
            'Authorization': 'Bearer ' + token,
            'userid': userId
        }
    })
    .then(user_data => {
        let newDiv3 = document.getElementById('newDiv3');

        // making a Popup container
        let popupContainer = document.createElement('div');
        newDiv3.appendChild(popupContainer);
        popupContainer.className = 'popup-container';

        // making the Popup
        let popup = document.createElement('section');
        popupContainer.appendChild(popup);
        popup.className = 'popup-view-expense';

        // Nameplate
        let nameplate = document.createElement('div');
        popup.appendChild(nameplate);
        nameplate.className = 'nameplate';
            // #1 (rank & name)
            let rankName = document.createElement('span');
            nameplate.appendChild(rankName);
            let rank = e.target.parentElement.parentElement.children[0].innerText;
            let name = e.target.parentElement.parentElement.children[1].innerText;
            rankName.innerText = `${rank} ${name}`;
            // #2 (total expense amount)
            let total = document.createElement('span');
            nameplate.appendChild(total);
            let totalExpenseAmount = e.target.parentElement.parentElement.children[2].innerText;
            total.innerText = `₹${totalExpenseAmount}`;

        // Bar Graph Container
        let barGraphContainer = document.createElement('span');
        popup.appendChild(barGraphContainer);
        barGraphContainer.id = 'bar-graph-container';

        // Bar Graph Legend
        let barGraphLegend = document.createElement('span');
        popup.appendChild(barGraphLegend);
        barGraphLegend.id = 'bar-graph-legend';
        // ul
        let u_list = document.createElement('ul');
        barGraphLegend.appendChild(u_list);
        u_list.style.listStyle = 'none';

        // close
        let close = document.createElement('button');
        popup.appendChild(close);
        close.className = 'closeViewExpense';
        close.innerHTML = '&times;';
        close.onclick = (e) => {
            e.preventDefault();
            popupContainer.remove();
        };

        // * NOTE (for instructing the user on how to use the chart)
        let note = document.createElement('div');
        popup.appendChild(note);
        note.className = 'note';
        note.innerHTML = `Note: The downward-bar-graph for a category represents the percentage of expenditure for that category out of the total expense amount. In other words, <u>the lower the bar the higher the expense!</u> You can hover your cursor over the legends on the right to see the respective bar highlight itself in the graph.`;

        let arr = user_data.data.user_data;
        let myMap = new Map(); // hashtable #1
        let colorMap = new Map(); // hashtable #2
        let totalAmount = 0;

        let categoryArr = ['Other', 'Clothes', 'Education', 'Electricity', 'Food', 'Fuel', 'Grocery', 'Health', 'Milk', 'Shopping', 'Travel', 'Water'];

        colorMap.set('Other', '#E15F59'); colorMap.set('Clothes', '#F2A051'); colorMap.set('Education', '#F8D558'); colorMap.set('Electricity', '#5FbF86'); colorMap.set('Food', '#4C8EE8'); colorMap.set('Fuel', '#6448F1'); colorMap.set('Grocery', '#A561D2'); colorMap.set('Health', '#222222'); colorMap.set('Milk', '#DD5FA6'); colorMap.set('Shopping', '#D0B792'); colorMap.set('Travel', '#C2C2C2'); colorMap.set('Water', '#91ACBE');

        for(let i of categoryArr) {
            let category = i;
            myMap.set(category, 0); // setting 'amount' for each category = 0
        }

        for(let i of arr) {
            let category = i.category; 
            let amount = i.amount;

            totalAmount += amount;
            
            myMap.set(category, (myMap.get(category) + amount));
        }

        let counter = 1; // for Grid row number range!
        for(let i of categoryArr) {
            let category = i;
            let amount = myMap.get(category);
            let percentage = amount/totalAmount;

            // Creating Bar Graph
            let bar = document.createElement('span');
            barGraphContainer.appendChild(bar);
            bar.style.height = `${percentage * 300}px`;
            bar.style.border = `1px solid ${colorMap.get(category)}`;
            bar.id = category;

            // Creating Bar Graph Legend - #1
            let li = document.createElement('li');
            u_list.appendChild(li);
            li.innerText = category;
            li.style.color = colorMap.get(category);
            li.style.fontSize = '1.2rem';
            li.style.cursor = 'pointer';
            li.style.display = 'grid';
            li.style.gridRow = `${counter} / ${counter+1}`;
            li.style.gridColumn = '1 / 2';
            li.addEventListener('mouseover', (e) => {
                e.preventDefault();
                let _category = e.target.innerText;
                let _span = document.getElementById(_category);
                _span.style.backgroundColor = colorMap.get(_category);
            });
            li.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                let _category = e.target.innerText;
                let _span = document.getElementById(_category);
                _span.style.backgroundColor = '#f6f6f6';
            });

            // Creating Bar Graph Legend - #2
            let li2 = document.createElement('li');
            u_list.appendChild(li2);
            li2.innerText = `₹${myMap.get(category)}`;
            li2.style.color = colorMap.get(category);
            li2.style.fontSize = '1.2rem';
            li2.style.cursor = 'pointer';
            li2.style.display = 'grid';
            li2.style.gridRow = `${counter} / ${counter+1}`;
            li2.style.gridColumn = '2 / 3';
            li2.addEventListener('mouseover', (e) => {
                e.preventDefault();
                let _category = e.target.previousElementSibling.innerText;
                let _span = document.getElementById(_category);
                _span.style.backgroundColor = colorMap.get(_category);
            });
            li2.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                let _category = e.target.previousElementSibling.innerText;
                let _span = document.getElementById(_category);
                _span.style.backgroundColor = '#f6f6f6';
            });

            counter++; // update
        }
    })
    .catch(err => {
        console.error(err);
        alert(`Error! Please refresh the page and try again!`);
    });
}

function premiumMembership(e) {
    e.preventDefault();

    let body = document.getElementsByTagName('body')[0];

    // popupContainer
    let popupContainer = document.createElement('div');
    body.appendChild(popupContainer);
    popupContainer.classList.add('popup-container');

    // popup
    let popup = document.createElement('div');
    popupContainer.appendChild(popup);
    popup.classList.add('popup');
    
    // close
    let close = document.createElement('button');
    popup.appendChild(close);
    close.classList.add('close');
    close.innerHTML = '&times;';
    close.onclick = (e) => {
        e.preventDefault();
        popupContainer.remove();
    };

    // h2
    let heading = document.createElement('h2');
    popup.appendChild(heading);
    heading.classList.add('heading');
    heading.innerText = 'Premium Membership';

    // p
    let para = document.createElement('p');
    popup.appendChild(para);
    para.innerText = 'By becoming a premium member you will get access to the following features -';

    // ul
    let ul = document.createElement('ul');
    popup.appendChild(ul);
        // li #1
        let li_1 = document.createElement('li');
        ul.appendChild(li_1);
        li_1.innerText = 'Dark Mode';
        // li #2
        let li_2 = document.createElement('li');
        ul.appendChild(li_2);
        li_2.innerText = 'Leaderboard';
        // li #3
        let li_3 = document.createElement('li');
        ul.appendChild(li_3);
        li_3.innerText = 'Premium Feeling';
    
    // br
    let br = document.createElement('br');
    popup.appendChild(br);
    
    // buyContainer
    let buyContainer = document.createElement('a');
    popup.appendChild(buyContainer);
    buyContainer.classList.add('buy-container');
    buyContainer.href = 'https://localhost:3000/views/payment.html';
        //buy
        let buy = document.createElement('span');
        buyContainer.appendChild(buy);
        buy.innerText = 'Buy';
        buy.classList.add('buy');
}

function deleteMyExpense(e) {
    e.preventDefault();

    let id = e.target.id;
    let expenseAmount = Number(e.target.parentElement.previousElementSibling.previousElementSibling.innerText);
    let token = localStorage.getItem('token');

    axios.post('https://localhost:3000/expense-tracker/my-expense/delete', {
        'id': id,
        'expenseAmount': expenseAmount
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

function getLeaderboardInfo() {
    return new Promise((resolve, reject) => {
        let token = localStorage.getItem('token');

        if(token !== null) {
            axios.get('https://localhost:3000/expense-tracker/my-leaderboard', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(leaderboardInfo => {
                resolve(leaderboardInfo.data);
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

// Getting user-expenses to fill into the expense-table
function getUserInfo_II() {
    return new Promise((resolve, reject) => {
        let token = localStorage.getItem('token');
        let currentPageNumber = 1;
        let rowsPerPage = localStorage.getItem('rowsPerPage'); // Dynamic Pagination

        // checking if token exists; then validating the token if it complies with the secret key in the backend
        if(token !== null) {
            axios.post(`https://localhost:3000/expense-tracker/my-expense`, {
                currentPageNumber: currentPageNumber,
                rowsPerPage: rowsPerPage
            },
            {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            .then(result => {
                let user_data = result.data.user_data;
                let totalExpenses = result.data.totalExpenses;
                let EXPENSES_PER_PAGE = result.data.EXPENSES_PER_PAGE;
                resolve({
                    user_data: user_data,
                    totalExpenses: totalExpenses,
                    EXPENSES_PER_PAGE: EXPENSES_PER_PAGE
                });
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
        axios.get(`https://localhost:3000/expense-tracker/track-expense`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(result => {
            const username = result.data.username;
            const isPremiumUser = result.data.isPremiumUser;
            dailyExpense(username, isPremiumUser);
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

    axios.post('https://localhost:3000/expense-tracker/login', {
        email: email.value,
        password: password.value
    })
    .then(result => {
        if(result.data.login == 'logged in successfully') {
            // alert(result.data.login);

            const username = result.data.username;
            const isPremiumUser = result.data.isPremiumUser;

            const token = result.data.token;
            localStorage.setItem('token', token);

            // after successfully logging in
            dailyExpense(username, isPremiumUser);
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
            /* Dynamic Pagination — 'rows per page' — another tr for 'thead' */
            let tr_rowsPerPage = document.createElement('tr');
            thead.appendChild(tr_rowsPerPage);
            tr_rowsPerPage.className = "rows-per-page-tr";
                // td for 'tr_rowsPerPage'
                let td_rowsPerPage = document.createElement('td');
                tr_rowsPerPage.appendChild(td_rowsPerPage);
                td_rowsPerPage.colSpan = 1;
                td_rowsPerPage.className = "rows-per-page-td";
                    /* label and select */
                    // #1
                    let label_rPP = document.createElement('label');
                    td_rowsPerPage.appendChild(label_rPP);
                    label_rPP.htmlFor = "rows-per-page";
                    label_rPP.innerText = "rows per page: ";
                    // #2
                    let select_rPP = document.createElement('select');
                    td_rowsPerPage.appendChild(select_rPP);
                    select_rPP.id = "rows-per-page";
                    // when user selects a different value from the options available
                    select_rPP.onchange = (e) => {
                        let options = e.target.children;

                        // finding and storing the new selected value in 'localStorage'!
                        for(i of options) {
                            if(i.selected) {
                                localStorage.setItem('rowsPerPage', i.value);
                            }
                        }

                        alert('Changes will be visible once the page reloads.');
                        location.reload(); // refreshing the page!
                    }
                        /* option */
                        // #0
                        let option_0_rpp = document.createElement('option');
                        select_rPP.appendChild(option_0_rpp);
                        option_0_rpp.value = "7";
                        option_0_rpp.innerText = "7";
                        // #1
                        let option_1_rpp = document.createElement('option');
                        select_rPP.appendChild(option_1_rpp);
                        option_1_rpp.value = "10";
                        option_1_rpp.innerText = "10";
                        // #2
                        let option_2_rpp = document.createElement('option');
                        select_rPP.appendChild(option_2_rpp);
                        option_2_rpp.value = "25";
                        option_2_rpp.innerText = "25";
                        // #3
                        let option_3_rpp = document.createElement('option');
                        select_rPP.appendChild(option_3_rpp);
                        option_3_rpp.value = "50";
                        option_3_rpp.innerText = "50";

                        // logic to add 'selected' to show which option is currently in use (from 'localStorage')
                        if(localStorage.getItem("rowsPerPage")) {
                            let rPP = localStorage.getItem("rowsPerPage");
                            if(rPP == 7) {
                                option_0_rpp.selected = true;
                            }
                            else if(rPP == 10) {
                                option_1_rpp.selected = true
                            }
                            else if(rPP == 25) {
                                option_2_rpp.selected = true
                            }
                            else if(rPP == 50) {
                                option_3_rpp.selected = true
                            }
                        }

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

        // Buttons for Pagination
        let pageButtonsContainer = document.createElement('div');
        newDiv2.appendChild(pageButtonsContainer);
        pageButtonsContainer.className = "pageButtons-container";

        // Getting user-expenses to fill into the expense-table (also helps with Pagination & Dynamic Pagination)
        getUserInfo_II()
        .then(data => {
            let user_data = data.user_data;
            let totalExpenses = data.totalExpenses;
            let EXPENSES_PER_PAGE = data.EXPENSES_PER_PAGE;

            /* making page buttons */
            let numberOfPages = Math.ceil(totalExpenses/EXPENSES_PER_PAGE);
            for(let i=0; i<numberOfPages; i++) {
                let pageButton = document.createElement('button');
                pageButtonsContainer.appendChild(pageButton);
                pageButton.innerText = i+1;
                pageButton.className = "pageButton";

                // pageButton '1' by default will be active
                if(i+1 == 1) {
                    pageButton.classList.add("pageButton-active");
                }
            }

            // capturing page button 'click' event through 'Event Bubbling'!
            newDiv2.addEventListener('click', (e) => {
                if(e.target.classList.contains('pageButton')) {
                    let pageButtons = document.getElementsByClassName('pageButtons-container')[0].children;

                    // removing the previously 'active' page button
                    for(i of pageButtons) {
                        if(i.classList.contains('pageButton-active')) {
                            i.classList.remove("pageButton-active");
                        }
                    }

                    // making current button 'active'
                    e.target.classList.add('pageButton-active');

                    /* getting the next set of Expenses with respect to the page button that got clicked! */
                    let token = localStorage.getItem('token');
                    let currentPageNumber = e.target.innerText;
                    let rowsPerPage = localStorage.getItem('rowsPerPage'); // Dynamic Pagination

                    if(token !== null) {
                        axios.post(`https://localhost:3000/expense-tracker/my-expense`, {
                            currentPageNumber: currentPageNumber,
                            rowsPerPage: rowsPerPage
                        },
                        {
                            headers: {
                                'Authorization': 'Bearer ' + token
                            }
                        })
                        .then(result => {
                            let user_data = result.data.user_data;
                            let totalExpenses = result.data.totalExpenses;
                            let EXPENSES_PER_PAGE = result.data.EXPENSES_PER_PAGE;

                            let dataLength = user_data.length;

                            let table = document.getElementsByClassName('expense-table')[0];
                            let tbody = table.children[1];
                            let tr_arr = tbody.children;

                            for(let i=0; i<EXPENSES_PER_PAGE; i++) {
                                let td_arr = tr_arr[i].children;

                                // renaming the 'td' already existing
                                if(dataLength != 0) {
                                    dataLength--;
                                    td_arr[0].innerText = ((currentPageNumber - 1) * EXPENSES_PER_PAGE) + (i+1); // S.No.
                                    td_arr[1].innerText = user_data[i].category; // Category
                                    td_arr[2].innerText = user_data[i].amount; // Expense Amount
                                    td_arr[3].innerText = user_data[i].description; // Description
                                    td_arr[4].children[0].innerText = "delete"; // Option — (i)
                                    td_arr[4].children[0].id = user_data[i].id; // Option — (ii)
                                }
                                // cleaning out the rest of the 'td'
                                else {
                                    td_arr[0].innerText = ""; // S.No.
                                    td_arr[1].innerText = ""; // Category
                                    td_arr[2].innerText = ""; // Expense Amount
                                    td_arr[3].innerText = ""; // Description
                                    td_arr[4].children[0].innerText = ""; // Option
                                }
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    }
                }
            });

            for(let i=0; i<user_data.length; i++) {
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

                // Option
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

    /* Dark Mode */
    let containerChangeTheme = document.getElementsByClassName('container')[0];
    let darkMode = containerChangeTheme.classList.contains('dark'); // boolean value
    if(darkMode) {
        table.classList.add('expense-table-dark');
        thead.classList.add('expense-table-thead-dark');
    }
    
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

    axios.post('https://localhost:3000/expense-tracker/track-expense', {
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

function dailyExpense(username, isPremiumUser) {
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

    // Log Out
    let logOut = document.createElement('button');
    logOut.innerText = "⏻";
    logOut.className = "log-out";
    container.appendChild(logOut);
    logOut.addEventListener('click', (e) => {
        localStorage.removeItem('token');
        location.reload();
    });

    // Generate Report
    let generateReport = document.createElement('button');
    generateReport.innerText = 'Generate Report';
    generateReport.id = 'generate-report';
    generateReport.onclick = (e) => {
        e.preventDefault();

        let body = document.getElementsByTagName('body')[0];

        let GR_popupContainer = document.createElement('div');
        body.appendChild(GR_popupContainer);
        GR_popupContainer.className = "GR-popup-container";
        GR_popupContainer.addEventListener('click', (e) => {
            if(e.target.className === "GR-popup-container") {
                GR_popupContainer.remove();
            }
        });

        let GR_popup = document.createElement('div');
        GR_popupContainer.appendChild(GR_popup);
        GR_popup.className = "GR-popup";

        // header container
        let headerContainer = document.createElement('div');
        GR_popup.appendChild(headerContainer);
        headerContainer.className = "header-container";
            // report header
            let reportHeader = document.createElement('h1');
            headerContainer.appendChild(reportHeader);
            reportHeader.innerText = 'Report';

        // main-content container
        let mainContentContainer = document.createElement('div');
        GR_popup.appendChild(mainContentContainer);
        mainContentContainer.className = "main-content-container";

        let token = localStorage.getItem('token');
        let reportArr; // optimising by storing report data; this prevents "downloadButton" from querying the database again!
        let totalExpense = 0;

        // get all relevant data from the database
        axios.get('https://localhost:3000/expense-tracker/report', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(userData => {
            reportArr = userData.data.arr;

            let table = document.createElement('table');
            mainContentContainer.appendChild(table);

            // #1
            let thead = document.createElement('thead');
            table.appendChild(thead);

            let tr_1 = document.createElement('tr');
            thead.appendChild(tr_1);

            let td_1 = document.createElement('td');
            tr_1.appendChild(td_1);
            td_1.innerText = "Category";

            let td_2 = document.createElement('td');
            tr_1.appendChild(td_2);
            td_2.innerText = "Expense";

            // #2
            let tbody = document.createElement('tbody');
            table.appendChild(tbody);
            for(i of reportArr) {
                let tr_2 = document.createElement('tr');
                tbody.appendChild(tr_2);

                let body_td_1 = document.createElement('td');
                tr_2.appendChild(body_td_1);
                body_td_1.innerText = i.category;

                let body_td_2 = document.createElement('td');
                tr_2.appendChild(body_td_2);
                body_td_2.innerText = "₹" + i.amount;
                totalExpense += i.amount;
            }

            // #3
            let tfoot = document.createElement('tfoot');
            table.appendChild(tfoot);

            let tr_3 = document.createElement('tr');
            tfoot.appendChild(tr_3);

            let foot_td_1 = document.createElement('td');
            tr_3.appendChild(foot_td_1);
            foot_td_1.innerText = "Total";
            foot_td_1.colSpan = "1";

            let foot_td_2 = document.createElement('td');
            tr_3.appendChild(foot_td_2);
            foot_td_2.innerText = "₹" + totalExpense;
        })
        .catch(err => console.error(err));

        // footer container
        let footerContainer = document.createElement('div');
        GR_popup.appendChild(footerContainer);
        footerContainer.className = "footer-container";
            // download history button
            let downloadHistory = document.createElement('button');
            footerContainer.appendChild(downloadHistory);
            downloadHistory.className = "GR-download-history";
            downloadHistory.innerText = `👓`;
            downloadHistory.addEventListener('click', (e) => {
                // download history container
                let downloadHistoryContainer = document.createElement('div');
                GR_popup.appendChild(downloadHistoryContainer);
                downloadHistoryContainer.className = "GR-download-history-container";
                downloadHistoryContainer.addEventListener('click', (e) => {
                    if(e.target.className === "GR-download-history-container") {
                        downloadHistoryContainer.remove();
                    }
                });
                    // download history popup
                    let downloadHistoryPopup = document.createElement('div');
                    downloadHistoryContainer.appendChild(downloadHistoryPopup);
                    downloadHistoryPopup.className = "GR-download-history-popup";
                        // header container
                        let downloadHistory_headerContainer = document.createElement('div');
                        downloadHistoryPopup.appendChild(downloadHistory_headerContainer);
                        downloadHistory_headerContainer.className = "header-container";
                            // download history header
                            let downloadHistory_Header = document.createElement('h1');
                            downloadHistory_headerContainer.appendChild(downloadHistory_Header);
                            downloadHistory_Header.innerText = 'Download History';
                
                        // main-content container
                        let downloadHistory_mainContentContainer = document.createElement('div');
                        downloadHistoryPopup.appendChild(downloadHistory_mainContentContainer);
                        downloadHistory_mainContentContainer.className = "main-content-container";

                let token = localStorage.getItem('token');
                axios.get('https://localhost:3000/expense-tracker/report/history', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(result => {
                    let arr = result.data.history;

                    let table = document.createElement('table');
                    downloadHistory_mainContentContainer.appendChild(table);
        
                    // #1
                    let thead = document.createElement('thead');
                    table.appendChild(thead);
        
                    let tr_1 = document.createElement('tr');
                    thead.appendChild(tr_1);
        
                    let td_1 = document.createElement('td');
                    tr_1.appendChild(td_1);
                    td_1.innerText = "S.No.";
        
                    let td_2 = document.createElement('td');
                    tr_1.appendChild(td_2);
                    td_2.innerText = "Date";
        
                    let td_3 = document.createElement('td');
                    tr_1.appendChild(td_3);
                    td_3.innerText = "Download Link";
        
                    // #2
                    let tbody = document.createElement('tbody');
                    table.appendChild(tbody);
                    for(let i=0; i<arr.length; i++) {
                        let tr_2 = document.createElement('tr');
                        tbody.appendChild(tr_2);
        
                        let body_td_1 = document.createElement('td');
                        tr_2.appendChild(body_td_1);
                        body_td_1.innerText = i+1;
        
                        let body_td_2 = document.createElement('td');
                        tr_2.appendChild(body_td_2);
                        body_td_2.innerText = arr[i].createdAt;
        
                        let body_td_3 = document.createElement('td');
                        tr_2.appendChild(body_td_3);
                            let downloadLink = document.createElement('a');
                            body_td_3.appendChild(downloadLink);
                            downloadLink.className = "download-link";
                            downloadLink.innerText = "⬇";
                            downloadLink.href = `${arr[i].url}`;
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Error! Please refresh the page.');
                });
            });

            // download button
            let downloadButton = document.createElement('button');
            footerContainer.appendChild(downloadButton);
            downloadButton.className = "GR-download-button";
            downloadButton.innerText = `⬇`;
            downloadButton.addEventListener('click', (e) => {
                let token = localStorage.getItem('token');
                // the backend talks to Amazon S3 and uploads the user data in a file format; Amazon S3 sends back the URL of the respective file to the backend as a response; the backend then sends back a response to the frontend containing the URL of the file; the URL is then put into an 'a' tag and is made to open which then leads to the browser downloading the file indirectly into the user's computer memory!
                axios.post('https://localhost:3000/expense-tracker/report/download', {
                    reportArr: reportArr,
                    totalExpense: totalExpense
                },
                {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                })
                .then(result => {
                    let fileURL = result.data.fileURL;
                    let a = document.createElement('a');
                    a.href = fileURL;
                    a.download = "Daily Expense Report.txt"; // renaming the file being downloaded
                    a.click();
                })
                .catch(err => {
                    console.error(err);
                    alert('Error! Please refresh the page.');
                });
            });
    };
    container.appendChild(generateReport);

    if(!isPremiumUser) {
        // Buy Premium Membership
        let premium = document.createElement('a');
        premium.innerText = '- Buy Premium Membership -';
        premium.id = 'premium';
        premium.onclick = premiumMembership;
        container.appendChild(premium);
    }
    else {
        // Generate Report (contd.)
        generateReport.style.top = '200px';

        // Dark Mode
        let darkMode_Button = document.createElement('button');
        darkMode_Button.innerText = 'Change Theme';
        darkMode_Button.id = 'changeTheme';
        darkMode_Button.onclick = (e) => {
            e.preventDefault();

            let containerChangeTheme = document.getElementsByClassName('container')[0];
            let darkMode = containerChangeTheme.classList.contains('dark'); // boolean value
            let Hi = document.getElementsByClassName('Hi')[0];
            let labelTag = document.getElementsByTagName('label');
            // Expense Table
            let expenseTable = document.getElementsByClassName('expense-table')[0];
            let tHead = document.getElementsByTagName('thead')[0];
            // Leaderboard Table
            let leaderboardTable = document.getElementsByClassName('leaderboard-table')[0];

            /* toggling between themes */
            if(darkMode) {
                containerChangeTheme.classList.remove('dark');
                Hi.classList.remove('Hi_dark');
                for(let i=0; i<labelTag.length; i++) {
                    labelTag[i].classList.remove('label_dark');
                }
                if(expenseTable) {
                    expenseTable.classList.remove('expense-table-dark');
                    tHead.classList.remove('expense-table-thead-dark');
                }
                if(leaderboardTable) {
                    leaderboardTable.classList.remove('leaderboard-table-dark');
                    tHead.classList.remove('leaderboard-table-thead-dark');
                }
            }
            else {
                containerChangeTheme.classList.add('dark');
                Hi.classList.add('Hi_dark');
                for(let i=0; i<labelTag.length; i++) {
                    let condition = (labelTag[i].htmlFor == "rows-per-page"); // preventing 'dark mode' on 'rows-per-page' label

                    if(!condition)
                        labelTag[i].classList.add('label_dark');
                }
                if(expenseTable) {
                    expenseTable.classList.add('expense-table-dark');
                    tHead.classList.add('expense-table-thead-dark');
                }
                if(leaderboardTable) {
                    leaderboardTable.classList.add('leaderboard-table-dark');
                    tHead.classList.add('leaderboard-table-thead-dark');
                }
            }
        };
        container.appendChild(darkMode_Button);

        // Leaderboard
        let leaderboard_Button = document.createElement('button');
        leaderboard_Button.innerText = 'View Leaderboard';
        leaderboard_Button.id = 'view-leaderboard';
        leaderboard_Button.onclick = (e) => {
            e.preventDefault();

            if(document.getElementById('newDiv3')) {
                // If Exists Then Do Nothing!
            }
            else {
                let newDiv = document.getElementById('newDiv');
                let newDiv2 = document.getElementById('newDiv2');
                if(newDiv2) {
                    newDiv2.remove();
                }
                else {
                    newDiv.classList.add('active');
                }
    
                let leaderboard_Div = document.createElement('div');
                container.appendChild(leaderboard_Div);
                leaderboard_Div.id = 'newDiv3';
    
                // table
                let leaderboard_table = document.createElement('table');
                leaderboard_Div.appendChild(leaderboard_table);
                leaderboard_table.className = 'leaderboard-table';
                    // thead
                    let thead = document.createElement('thead');
                    leaderboard_table.appendChild(thead);
                        // #1 tr for 'thead'
                        let tr_leaderboard = document.createElement('tr');
                        thead.appendChild(tr_leaderboard);
                            // td for 'tr_leaderboard'
                            let td_leaderboard = document.createElement('td');
                            tr_leaderboard.appendChild(td_leaderboard);
                            td_leaderboard.innerText = 'Leaderboard';
                            td_leaderboard.colSpan = 4;
    
                        // #2 tr for 'thead'
                        let tr_thead = document.createElement('tr');
                        thead.appendChild(tr_thead);
                            // td for 'tr_thead'
                            let td_tr_thead_1 = document.createElement('td');
                            tr_thead.appendChild(td_tr_thead_1);
                            td_tr_thead_1.innerText = 'Rank';
    
                            let td_tr_thead_2 = document.createElement('td');
                            tr_thead.appendChild(td_tr_thead_2);
                            td_tr_thead_2.innerText = 'Name';
    
                            let td_tr_thead_3 = document.createElement('td');
                            tr_thead.appendChild(td_tr_thead_3);
                            td_tr_thead_3.innerText = 'Total Expense Amount (₹)';
    
                            let td_tr_thead_4 = document.createElement('td');
                            tr_thead.appendChild(td_tr_thead_4);
                            td_tr_thead_4.innerText = 'Option';
                    
                    // tbody
                    let tbody = document.createElement('tbody');
                    leaderboard_table.appendChild(tbody);

                    getLeaderboardInfo()
                    .then(leaderboardInfo => {
                        let arr = leaderboardInfo.arr;
                        let userId = leaderboardInfo.userId;

                        for(let i=0; i<arr.length; i++) {
                            let tr = document.createElement('tr');
                            tbody.appendChild(tr);

                            // for highlighting the current User's stat in the leaderboard!
                            if(arr[i].userId == userId) {
                                tr.style.border = '2px solid #FFD877';
                            }

                            // Rank
                            let td_1 = document.createElement('td');
                            tr.appendChild(td_1);
                            td_1.innerText = '#' + `${i+1}`;

                            // Name
                            let td_2 = document.createElement('td');
                            tr.appendChild(td_2);
                            td_2.innerText = arr[i].name;

                            // Total Expense Amount (₹)
                            let td_3 = document.createElement('td');
                            tr.appendChild(td_3);
                            td_3.innerText = arr[i].totalExpenseAmount;

                            // Option
                            let td_5 = document.createElement('td');
                            tr.appendChild(td_5);
                                // a
                                let a1 = document.createElement('a');
                                td_5.appendChild(a1);
                                a1.innerText = 'view expense graph';
                                a1.id = arr[i].userId;
                                a1.addEventListener('click', viewExpense);
                        }

                        /* Dark Mode */
                        let containerChangeTheme = document.getElementsByClassName('container')[0];
                        let darkMode = containerChangeTheme.classList.contains('dark'); // boolean value
                        if(darkMode) {
                            leaderboard_table.classList.add('leaderboard-table-dark');
                            thead.classList.add('leaderboard-table-thead-dark');
                        }

                        // link
                        let addNewExpense = document.createElement('a');
                        leaderboard_Div.appendChild(addNewExpense);
                        addNewExpense.id = 'addNewExpense';
                        addNewExpense.innerText = '← Go Back';
                        addNewExpense.onclick = () => {
                            // delete 'newDiv3' and go back
                            document.getElementById('newDiv3').remove();
                            document.getElementById('newDiv').classList.remove('active');
                        };
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        };
        container.appendChild(leaderboard_Button);
    }

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
            input1.step = 0.01;
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

    /* runs only for the first time after the user becomes a Premium User! */
    if(localStorage.getItem('isPremiumUser') == 'true') {
        localStorage.removeItem('isPremiumUser');

        /* same code as the one in 'Dark Mode' */
        let containerChangeTheme = document.getElementsByClassName('container')[0];
        let Hi = document.getElementsByClassName('Hi')[0];
        let labelTag = document.getElementsByTagName('label');

        containerChangeTheme.classList.add('dark');
        Hi.classList.add('Hi_dark');
        for(let i=0; i<labelTag.length; i++) {
            labelTag[i].classList.add('label_dark');
        }
    }
}