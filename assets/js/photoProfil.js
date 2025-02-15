document.addEventListener("DOMContentLoaded", function () {
    let dropzone = document.querySelector('.dropzone');
    //let inputFile = document.getElementById("profilePicture");
    let inputFile = document.querySelector('input[type="file"]');
    let profilePreview = document.getElementById("profilePreview");

    // ✅ Gestion du survol de la zone de drop
    dropzone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropzone.classList.add("drag-over");
    });

    dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("drag-over");
    });

    // ✅ Gestion du drop d'image
    dropzone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropzone.classList.remove("drag-over");

        let file = e.dataTransfer.files[0];
        inputFile.files = e.dataTransfer.files;

        let reader = new FileReader();
        reader.onload = function (e) {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // ✅ Gestion du changement de fichier via input
    inputFile.addEventListener("change", function () {
        let file = inputFile.files[0];

        let reader = new FileReader();
        reader.onload = function (e) {
            profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // ✅ Clique sur la dropzone ouvre l'input file
    dropzone.addEventListener("click", function () {
        inputFile.click();
    });
});