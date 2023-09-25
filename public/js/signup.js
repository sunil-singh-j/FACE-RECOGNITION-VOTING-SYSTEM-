const signupForm = document.getElementById('signupForm');
const userNameInput = document.getElementById('userName');
const photo1Input = document.getElementById('photo1');
const photo2Input = document.getElementById('photo2');
const statusMessage = document.getElementById('status');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userName = userNameInput.value;
    
    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('photo1', photo1Input.files[0]);
    formData.append('photo2', photo2Input.files[0]);
    
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        statusMessage.textContent = data.message;
    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Error occurred during signup: ' + error.message;
    }
});
