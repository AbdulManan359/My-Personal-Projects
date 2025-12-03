// const btn = document.getElementById("btn");
// btn.addEventListener("click", (event) => {
//     event.preventDefault(); // This will prevent default link  behaviour.
//     window.location.href = `/addblog`;
// })

//Events-Start 


function goToPageClass(clickedElementClass, locationOrEndpoint) {
    const collection = document.getElementsByClassName(clickedElementClass);
    console.log("Collection of element is: ", collection);
    for (let i = 0; i < collection.length; i++) {
        collection[i].addEventListener("click", () => {
            console.log("Iam working");
            window.location.href = locationOrEndpoint;
        })
    }


}


goToPageClass("seeMore", "http://localhost:3000/blogs");
goToPageClass("logInBtn", "http://localhost:3000/signin");
goToPageClass("signUpBtn", "http://localhost:3000/signup");
goToPageClass("lgOtBtn", "http://localhost:3000/signout");
goToPageClass("addBlog", "http://localhost:3000/addblog");





const borderEffectElement = document.getElementsByClassName("borderEffect");
for (let i = 0; i < borderEffectElement.length; i++) {
    borderEffectElement[i].addEventListener("mouseover", () => {
        console.log("iam working");

        borderEffectElement[i].classList.toggle("smallBorder");
    })
    borderEffectElement[i].addEventListener("mouseout", () => {
        console.log("iam working");
        borderEffectElement[i].classList.toggle("smallBorder");
    })
}






//Events-End 