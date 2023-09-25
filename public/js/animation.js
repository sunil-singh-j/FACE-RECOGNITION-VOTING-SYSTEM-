document.getElementById("nameForm").addEventListener("submit", function (event) {
    event.preventDefault();
    showLoadingAnimation();

    // Simulate loading process
    setTimeout(function () {
        hideLoadingAnimation();
        document.getElementById("videoInput").style.display = "block";
    }, 3000); // Adjust the timeout as needed
});

function showLoadingAnimation() {
    document.getElementById("loadingAnimation").style.display = "block";
}

function hideLoadingAnimation() {
    document.getElementById("loadingAnimation").style.display = "none";
}
