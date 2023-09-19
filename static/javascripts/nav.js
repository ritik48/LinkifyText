const mode = document.querySelector(".mode");
const square = document.querySelector(".square");

const copy_img = document.querySelector(".copy img");
const edit_img = document.querySelector(".edit img");

let darkmode = localStorage.getItem("darkmode");

const current_path = window.location.pathname;

const enableDarkMode = () => {
    try {
        copy_img.src = "/assets/copy_dark_mode.svg";
        edit_img.src = "/assets/edit_dark_mode.svg";
    } catch {}

    if (!current_path.includes("view")) {
        // console.log("yes2");
        let t = document.querySelector("textarea");
        // t.focus();
    }

    square.style.backgroundColor = "#caccca";
    document.querySelector("body").classList.add("dark-mode");

    localStorage.setItem("darkmode", "enabled");
};

const disableDarkMode = () => {
    try {
        copy_img.src = "/assets/copy_light_mode.svg";
        edit_img.src = "/assets/edit_light_mode.svg";
    } catch {}

    if (!current_path.includes("view")) {
        // console.log("yes");
        let t = document.querySelector("textarea");
        // t.focus();
    }
    square.style.backgroundColor = "";
    document.querySelector("body").classList.remove("dark-mode");

    localStorage.setItem("darkmode", null);
};

if (darkmode === "enabled") {
    square.style.left = "20px";
    enableDarkMode();
} else {
    if (current_path.includes("view")) {
        copy_img.src = "/assets/copy_light_mode.svg";
        edit_img.src = "/assets/edit_light_mode.svg";
    }
}

mode.addEventListener("click", (e) => {
    e.stopPropagation();
    darkmode = localStorage.getItem("darkmode");
    if (darkmode !== "enabled") {
        square.style.left = "20px";
        enableDarkMode();
    } else {
        square.style.left = "2px";
        disableDarkMode();
    }
});
