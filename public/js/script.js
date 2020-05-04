// console.log('test');

//this code prevents empty fields being submitted to the databse

const usernameField = document.querySelector('#username');
const signUpSubmit = document.querySelector('#signUpSubmit');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');

if(typeof (signUpSubmit) != 'underfined' && signUpSubmit != null){
    signUpSubmit.addEventListener('click', (e) => {
        if(usernameField.value === ''){
            e.preventDefault();
            window.alert('Form Requires Username');
        }
        if(password.value != confirmPassword.value){
            e.preventDefault();
            window.alert('Passwords Do Not Match');
        }
    });
}

const messageContainer = document.querySelector('.messageContainer');
//whatever is on the end of the url after the ?
const queryString = window.location.search;

if(queryString == '?incorrectLogin'){
    messageContainer.innerHTML = `<div class="card-panel red">Incorect Login Details</div>`;
}

if(queryString == '?contactSaved'){
    messageContainer.innerHTML = `<div class="card-panel green">contactSaved</div>`;
}
