document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    let hasVoted = false;

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!hasVoted) {
                hasVoted = true;
                const selectedParty = button.innerText;

                // Store the selected party in a variable or send it to the server

                // Navigate to the success page
                window.location.href = 'voted-successful.html';
            }
        });
    });
});
