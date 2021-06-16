import "progressive-picture";
import { setReactivity, $, $$, hydro, render, html } from "hydro-js";
import { openMenu, closeMenu } from "./animation.js";

const headerImg = $(".header-img")!;
const followElem = $(".follow")!;
const span = $(".follow span")!;
const menuDrawer = $(".menudrawer")!;

let isOpen = false;

setBindings();

function setBindings() {
  setReactivity(document.body, {
    toggle() {
      followElem.classList.toggle("active-follow");
      const willFollow = span.textContent === "Follow";
      if (willFollow) {
        span.textContent = "✔ Following";
        hydro.person.followers += 1;
      } else {
        span.textContent = "Follow";
        hydro.person.followers -= 1;
      }
    },
    toggleMenu() {
      menuDrawer.classList.toggle("hide-menu");
      if (isOpen) {
        isOpen = false;
        closeMenu();
      } else {
        isOpen = true;
        openMenu();
      }
    },
    transitionend() {
      headerImg.classList.remove("header-img-transition");
    },
    selectProfile({ target }: any) {
      if (location.pathname !== "/group") return;

      const div =
        target.parentNode.localName === "div"
          ? target.parentNode
          : target.closest("div");
      const profileDiv = $(".profile-photo") as HTMLDivElement;

      const index = [...div.classList.values()]
        .filter((className) => /profile-\d/.test(className))
        .pop()
        .split("profile-")
        .pop();
      const indexReplacment = [...profileDiv.classList.values()]
        .filter((className) => /profile-\d/.test(className))
        .pop()!
        .split("profile-")
        .pop();
      const multIndex = Number(index) || Number(indexReplacment);

      const newPerson = { ...hydro.persons[index] };
      hydro.person.fullname = newPerson.fullname;
      hydro.person.firstname = newPerson.firstname;
      hydro.person.followers = newPerson.followers;
      hydro.person.following = newPerson.following;

      profileDiv.classList.remove("profile-photo");
      profileDiv.classList.add("profile-photo-secondary");
      profileDiv.style.transform = `perspective(1px) translate3d(${
        -70 + multIndex * 55
      }px, -70px, 0) scale(0.25)`;

      div.classList.remove("profile-photo-secondary");
      div.classList.add("profile-photo");
      div.style.transform = `perspective(1px) translate3d(-70px, -70px, 0) scale(0.25)`;
    },
  });
}

const styles = html`<style>
  *,
  *:before,
  *:after {
    color: inherit;
    background-clip: initial;
    -webkit-background-clip: initial;
  }
  .follow {
    background-color: orangered;
  }
</style>`;

// Listener for HMR
if (process.env.NODE_ENV === "production") {
  // Show Content after setting binding
  render(styles);
} else {
  addEventListener("afterRouting", () => {
    if (document.body.textContent!.includes("{{")) setBindings();
    if (!$("body > style")) render(styles);

    $$("picture > img").forEach((img) => {
      const src = (img as HTMLImageElement).dataset.src;
      if (src) {
        (img as HTMLImageElement).src = src;
        img.removeAttribute("data-src");
      }
    });
  });
}
