const container = document.getElementsByClassName("container");
console.log(container[0]);

for (let i = 0; i < container.length; i++) {
    container[i].addEventListener("mouseover", (event) => {
        container[i].classList.toggle("bookDetail2");
    })
    container[i].addEventListener("mouseout", (event) => {
        container[i].classList.toggle("bookDetail2");
    })
}
