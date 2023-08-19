# Expense-Tracker

## What is it?

It goes by the name of _Expense-Tracker_ 💰. It is a website designed to help a human being keep track of what they spend their money on. The money could've been spent on a product/service. All that the user 👨🏻‍🦱 needs to do to create a new expense is add in the following information regarding their expenditure:

1. select the right category from a list (like Food 🌯, Clothes 👕, Health ⛑️, etc.) that matches the product/service purchased
2. add the expense amount (in INR ₹)
3. add a description 📝 (optional)

Finally to save all that information the user would have to click a button labelled 'Track'. All that information would then get saved into a database. A user could then view all of their expenses in a form of a tabulated list in a paginated fashion.

## Features

- _Sign-up_ page ✍️ for a new user.

- _Login_ page 👋 for an existing user.

- _Track_ 📝 : User can add a new expenditure to track.

- _View All My Expenses_ 👀 : User can view all their expenses that they have added to track.

- _Generate Report_ 🖨️ : User can generate a report that summarises their expenses with respect to categories (like Food, Clothes, etc.). This report can then be downloaded as a text file.

- _Download History_ ⬇️ : User will be able to access download links for all the generated reports that were previously downloaded.

- _Premium Features_ ⭐️ : To avail this service a user needs to pay a fixed price.
  - _Dark Mode_ 🌚 : Helps the user view their dashboard in a dark grey colour that is easy on the eyes while viewing in the dark with low screen brightness.
  - _Leaderboard_ 👑 : That user who has spent the least amount of money till date gets their name on top of the list!
    - _Expense Graph_ 📊 : It is a downward bar graph that represents an individual's expenses in a certain category (in %). A user can view other's spending habits right from the Leaderboard.

- _Forgot Password_ 😱 : If a user forgets their password, no worries! All they have to do is fill in their email address and click the 'Reset' button. A password reset link would then get sent to their inbox. They can open the link, re-enter a password of their choice and be happy for the rest of their life!

## Brief information about technologies used

- _HTTPS_ : Hypertext Transfer Protocol Secure is used to protect user information being passed over the internet from bad actors by encrypting it such that it can only be deciphered using a private key that resides in the server at all times. A certificate is provided to a client visiting the website to assure them of the authenticity of the domain (an OpenSSL command generates private key and certificate).

- _MySQL Database_ : It is used to store important credentials about the users of the website. It is a relational database management system that allows to define a complex relationship among different database models with ease.

- _bcrypt_ : It is an algorithm that helps hash and salt a user's password, keeping it secret from malicious actors. Even if a data leak occurs directly from the database, a user's password will remain concealed. One significant advantage of this cipher algorithm is its scalability, enabling it to withstand increasing computing power. Suppose, for example, a developer implemented bcrypt to protect user passwords in 2013. Fast forward ten years to 2023, and if a password gets leaked, a malicious actor with a powerful computer might assume they could quickly decipher it. However, what this actor doesn't realize is that a smart developer (that's me 👨🏻‍💻) who is aware of Moore's Law has already recognized the need to increase the 'salt' rounds. These rounds enhance the encryption's complexity, making it significantly more time-consuming for a more powerful computer to decrypt.

- _JWT_ : JSON Web Token is a token that is provided to the user upon logging in. It gets stored in the local storage of the user's computer. It is stateless in nature, meaning the server doesn't need to store any specific information regarding a particular user nor does it have to do a database lookup to find the user. These two qualities make it a valuable choice in designing a scalable computing system. It has three parts: the first says it's a JWT, the second has important information about the user, and the third makes sure the code hasn't been tampered with. User can use it to show that their allowed to do certain things without telling their password every time.

- _UUID_ : UUID stands for 'Universally Unique Identifier' and it is a long string of characters that is highly likely to be unique across different devices and systems. I used this as a data type in the database so as to have a unique 'Forgot Password' URL for any user.

- _Helmet_ : It is a middleware for Node.js that helps protect against common security threats by setting in required HTTP headers. This makes it a breeze for a developer to follow security best practices quite simply!

- _morgan_ : It is a middleware for Node.js that helps log requests made to the server by storing it in a file in a desirable format. This is mainly useful to analyze incoming requests, monitor performance and debug potential issues. I used it for the sake of using it!

## Third-party APIs used 

- _Razorpay_ : For a demo payment service to allow the user to buy _Premium Features_ ⭐️.

- _SendGrid_ : For delivering password reset links via user's email address for _Forgot Password_ 😱.

- _AWS SDK (for Amazon S3)_ : When the download button is clicked in the _Generate Report_ 🖨️ section, the generated report file is first uploaded to Amazon S3. Once the upload is complete, the link is opened, and the file starts downloading to the user's device. This link is saved in the database to showcase it to the user in the _Download History_ ⬇️ section.

## Install the following

- **Nodemon** `npm install --save-dev nodemon`

- **Express** `npm install express --save`

- **Body-Parser** `npm install body-parser --save`

- **MySQL2** `npm install --save mysql2`

- **Sequelize** `npm install --save sequelize`

- **CORS** `npm install cors`

- **dotenv** `npm install dotenv --save`

- **bcrypt** `npm install --save bcrypt`

- **jwt** `npm install jsonwebtoken`

- **Razorpay** `npm install razorpay`

- **SendGrid** `npm install --save @sendgrid/mail`

- **uuid** `npm i uuid` *(or make use of the in-built UUID data type in Sequelize directly for defining the data type; I did the one in parentheses!)*

- **aws-sdk** `npm i aws-sdk`

- **Helmet** `npm install helmet --save`

- **morgan** `npm install morgan --save`

- **OpenSSL** `openssl req -nodes -new -x509 -keyout server.key -out server.cert` *(command for creating a certificate; helps encrypt data being shared between Server and Client)*
