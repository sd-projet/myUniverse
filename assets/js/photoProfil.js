class ImageUploader {
    constructor(dropzoneSelector, inputFileSelector, profilePreviewSelector) {
        this.dropzone = document.querySelector(dropzoneSelector);
        this.inputFile = document.querySelector(inputFileSelector);
        this.profilePreview = document.getElementById(profilePreviewSelector);

        // Gestion du survol de la zone de drop
        this.addDragAndDropEvents();
        
        // Gestion du changement de fichier via input
        this.addFileInputChangeEvent();

        // Gestion du clic sur la dropzone pour ouvrir l'input file
        this.addDropzoneClickEvent();
    }

    addDragAndDropEvents() {
        // Gestion du survol de la zone de drop
        this.dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.dropzone.classList.add("drag-over");
        });

        this.dropzone.addEventListener("dragleave", () => {
            this.dropzone.classList.remove("drag-over");
        });

        // Gestion du drop d'image
        this.dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            this.dropzone.classList.remove("drag-over");

            let file = e.dataTransfer.files[0];
            this.inputFile.files = e.dataTransfer.files;

            this.readFile(file);
        });
    }

    addFileInputChangeEvent() {
        // Gestion du changement de fichier via input
        this.inputFile.addEventListener("change", () => {
            let file = this.inputFile.files[0];
            this.readFile(file);
        });
    }

    addDropzoneClickEvent() {
        // Clique sur la dropzone ouvre l'input file
        this.dropzone.addEventListener("click", () => {
            this.inputFile.click();
        });
    }

    readFile(file) {
        let reader = new FileReader();
        reader.onload = (e) => {
            this.profilePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Création d'une instance de ImageUploader après le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
    const imageUploader = new ImageUploader('.dropzone', 'input[type="file"]', 'profilePreview');
});
