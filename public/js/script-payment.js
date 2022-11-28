document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();
    
    payment();
});

async function payment() {
    let token = localStorage.getItem('token');
        
    if(token !== null) {
        const response  = await axios.get('https://localhost:3000/payment/premiumMembership',
        {
            headers: {
                "Authorization" : 'Bearer ' + token
            }
        })
        .catch(err => {
            console.log(err);
            alert('Error! Please go back & try again!');
        });
        
        var options = {
            "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
            "name": "Expense Tracker",
            "order_id": response.data.order.id, // For one time payment
            "prefill": {
                "name": response.data.username,
                "email": response.data.email,
                "contact": response.data.phoneNo
            },
            "theme": {
                "color": "#FFD877"
            },
            // This handler function will handle the success payment
            "handler": function (response) {
                axios.post('https://localhost:3000/payment/updateTransactionStatus',
                {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id,
                },
                {
                    headers: {
                        "Authorization" : 'Bearer ' + token
                    }
                })
                .then((res) => {
                    localStorage.setItem('isPremiumUser', 'true');
                    alert('You are a Premium User Now');
                })
                .catch(() => {
                    alert('Something went wrong. Try Again!!!')
                })
            }
        };
    
        const rzp1 = new Razorpay(options);
        rzp1.open();
        // e.preventDefault();
    
        rzp1.on('payment.failed', function (response){
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
        });
    }
}