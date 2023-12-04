const menu = document.getElementById("menu");
const mobile_nav = document.getElementById("mobile_nav");

const form = document.getElementById("form");
const input_link = document.getElementById("input_link");
const on_error = document.getElementById("on-error");
const shorten_links = document.querySelector(".shorten_links");


// nav for md/sm screen
first_click = true;
menu.addEventListener("click",() => {
    if (first_click) {
        menu.querySelector("span:first-child").style.cssText = "transform: rotate(45deg);transform-origin: 2px 2px;";
        menu.querySelector("span:nth-child(2)").style.cssText = "transform: translateX(50px);opacity: 0";
        menu.querySelector("span:last-child").style.cssText = "transform: rotate(-45deg);transform-origin: 2px -1px;";
        mobile_nav.style.opacity = "1";
        mobile_nav.style.visibility = "visible";
        first_click = !first_click;
    }else {
        menu.querySelector("span:first-child").style.cssText = "transform: rotate(0deg);";
        menu.querySelector("span:nth-child(2)").style.cssText = "opacity: 1";
        menu.querySelector("span:last-child").style.cssText = "transform: rotate(0deg);";
        mobile_nav.style.opacity = "0";
        mobile_nav.style.visibility = "hidden";
        first_click = !first_click;
    }
})


// Save the shorted URLs into localStorage
function SaveShorted(original_url,shorten_url) {
    let created_urls = JSON.parse(localStorage.getItem('created_urls')) || [];
    let created_at = new Date();
    let newUrl = {
        "created_at": created_at,
        "original_url": original_url,
        "shorten_url": shorten_url,
    }
    let userExists = created_urls.some(user => user.original_url === newUrl.original_url);
    if (!userExists) {
        created_urls.push(newUrl);
        localStorage.setItem('created_urls', JSON.stringify(created_urls));
    }
}

// Add Already shorted URLs into page (from localStorage)
function AddFromLocal() {
    if (localStorage.getItem('created_urls')) {
        let created_urls = JSON.parse(localStorage.getItem('created_urls'));
        created_urls.forEach((value) => {
            AddShorted(value["original_url"],value["shorten_url"]);
        })
        MakeUrlCopy()
    }
}



// a function to copy the shorted link into clipboard
function MakeUrlCopy() {
    const copy_shorten__btn = document.querySelectorAll(".copy_shorten");
    copy_shorten__btn.forEach((element) => {
        element.addEventListener("click",(e) => {
            let text= e.target.parentElement.children[0].innerText;
            navigator.clipboard.writeText(text)
            e.target.style.cssText = "background-color: hsl(257, 27%, 26%);font-size: 1.1rem;padding: 0.3rem 1rem;";
            e.target.innerText = "Copied!";
        })
    })

}

MakeUrlCopy()

// a function that add add shorted url into page
function AddShorted(original_url,shorten_url) {
    let shorten_link = `
    <div class="links_container">
        <div class="original_url">
            <a href="${original_url}" target="_blank">
                <abbr title="Original link">${original_url}</abbr>
            </a>
        </div>
        <div class="shorten_url">
            <a href="${shorten_url}" target="_blank">
                <abbr title="Shorted link">${shorten_url}</abbr>
            </a>
            <button class="styled-btn copy_shorten">Copy</button>
        </div>
    </div>
    `

    var tempElement = document.createElement('div');
    tempElement.innerHTML = shorten_link;
    tempElement.style.marginBottom = "1rem";
    const shorten_links = document.querySelector(".shorten_links");
    shorten_links.append(tempElement);
}

// Short the original link and return it as a short link
async function LinkShorter(original_url) {
    try {
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(original_url)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data["shorturl"];
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}





form.addEventListener("submit",(e) => {
    e.preventDefault();
    let original_url = input_link.value;
    input_link.value = "";

    let url_regex = /^(https?):\/\/[^\s$.?#].[^\s]*$/gm;
    let is_valid = url_regex.test(original_url);
    if(is_valid) {
        input_link.style.cssText = "border: none;";
        on_error.style.cssText = "visibility: hidden;opacity: 0;";

        

        (async () => {
            try {
                const shortenedURL = await LinkShorter(original_url);
                let arr_already_shorted = [];
                document.querySelectorAll(".original_url").forEach((element)=>{
                    arr_already_shorted.push(element.innerText);
                })
                let is_already_shorted = arr_already_shorted.some(url => url === original_url);
                if(is_already_shorted === false) {
                    AddShorted(original_url,shortenedURL); 
                }else {
                    console.log("URL already shorted");
                    on_error.innerText = "URL Already Shorted";
                    input_link.style.cssText = "border: 2px solid hsl(0, 87%, 67%);";
                    on_error.style.cssText = "visibility: visible;opacity: 1;"; 
                }
                MakeUrlCopy();
                SaveShorted(original_url,shortenedURL);

            } catch (error) {
                console.error('Error occurred:', error);
            }
        })();
    }else {
        on_error.innerText = "Please add a link";
        input_link.style.cssText = "border: 2px solid hsl(0, 87%, 67%);";
        on_error.style.cssText = "visibility: visible;opacity: 1;";  
    }
})









AddFromLocal();